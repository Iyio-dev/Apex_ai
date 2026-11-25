import "dotenv/config";
import mongoose from "mongoose";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Syllabus from "../src/models/Syllabus.js";

const here = dirname(fileURLToPath(import.meta.url));
const archivePath = resolve(here, "../data/syllabus-archive.json");
const apply = process.argv.includes("--apply");
const replace = process.argv.includes("--replace");
const normalize = (value) => String(value || "").trim().toLowerCase();

const records = JSON.parse(await readFile(archivePath, "utf8"));
if (!Array.isArray(records) || records.length === 0) throw new Error("Archive must be a non-empty array.");
const keys = new Set();
let topicCount = 0;
for (const record of records) {
  if (!record.programme || !record.subject || !Array.isArray(record.topics) || !record.topics.length) {
    throw new Error("Each record requires programme, subject and a non-empty topics array.");
  }
  const key = `${normalize(record.programme)}|${normalize(record.subject)}`;
  if (keys.has(key)) throw new Error(`Duplicate archive record: ${record.programme} / ${record.subject}`);
  keys.add(key);
  const topicNames = new Set();
  for (const topic of record.topics) {
    if (!topic.name || !Array.isArray(topic.subtopics) || !topic.subtopics.length || !Array.isArray(topic.objectives) || !topic.objectives.length) {
      throw new Error(`Topic '${topic.name || "(unnamed)"}' must have subtopics and objectives.`);
    }
    const topicKey = normalize(topic.name);
    if (topicNames.has(topicKey)) throw new Error(`Duplicate topic '${topic.name}' in ${record.subject}.`);
    topicNames.add(topicKey);
    if (topic.objectives.some((item) => !item.trim() || item.length > 240)) {
      throw new Error(`Objective for '${topic.name}' is empty or exceeds the model's 240-character limit.`);
    }
    topicCount += 1;
  }
}

console.log(`Archive valid: ${records.length} subjects, ${topicCount} topics.`);
if (!apply) {
  console.log("Dry run only. No database connection or writes were made. Use --apply to import.");
  process.exit(0);
}
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required for --apply.");

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  for (const record of records) {
    const existing = await Syllabus.findOne({ programme: record.programme, subject: record.subject }).lean();
    const oldTopics = new Map((existing?.topics || []).map((topic) => [normalize(topic.name), topic]));
    const mergedTopics = record.topics.map((topic) => {
      const previous = oldTopics.get(normalize(topic.name));
      if (!previous) return topic;
      const oldSubtopics = new Map((previous.subtopics || []).map((subtopic) => [normalize(subtopic.name), subtopic]));
      const subtopics = topic.subtopics.map((subtopic) => {
        const oldSubtopic = oldSubtopics.get(normalize(subtopic.name));
        return oldSubtopic ? { ...subtopic, _id: oldSubtopic._id } : subtopic;
      });
      return {
        ...topic,
        _id: previous._id,
        lectureCovered: previous.lectureCovered ?? false,
        predictedNext: previous.predictedNext ?? false,
        subtopics
      };
    });
    if (!replace && existing) {
      const importedNames = new Set(mergedTopics.map((topic) => normalize(topic.name)));
      mergedTopics.push(...(existing.topics || []).filter((topic) => !importedNames.has(normalize(topic.name))));
    }
    await Syllabus.findOneAndUpdate(
      { programme: record.programme, subject: record.subject },
      { $set: { ...record, topics: mergedTopics } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`${replace ? "Replaced" : "Merged"} ${record.programme} / ${record.subject}: ${record.topics.length} archive topics.`);
  }
  console.log("Syllabus archive import completed.");
} finally {
  await mongoose.disconnect();
}
