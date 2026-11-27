import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "node:fs/promises";
import Syllabus from "../src/models/Syllabus.js";

dotenv.config();

const apply = process.argv.includes("--apply");

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

async function seed() {
  try {
    const records = JSON.parse(
      await fs.readFile(
        new URL("./seed.json", import.meta.url),
        "utf8"
      )
    );

    if (!Array.isArray(records) || !records.length) {
      throw new Error("Invalid seed.json file");
    }

    const seen = new Set();

    for (const record of records) {
      const doc = new Syllabus(record);

      await doc.validate();

      const key = normalize(
        `${doc.programme}:${doc.subject}`
      );

      if (seen.has(key)) {
        throw new Error(
          `Duplicate subject: ${doc.subject}`
        );
      }

      seen.add(key);

      if (
        !doc.topics.length ||
        doc.topics.some(
          (topic) =>
            !topic.courseCode ||
            !topic.objectives?.length ||
            topic.subtopics.some(
              (sub) => !sub.objectives?.length
            )
        )
      ) {
        throw new Error(
          `Missing curriculum fields for ${doc.subject}. Check your Syllabus model.`
        );
      }
    }

    console.log(`Validated ${records.length} subjects.`);

    if (!apply) {
      console.log("Validation successful.");
      console.log("No database changes made.");
      return;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `Connected to database: ${mongoose.connection.name}`
    );

    await Syllabus.init();

    let inserted = 0;
    let merged = 0;
    let unresolved = 0;

    for (const record of records) {
      const existing = (
        await Syllabus.find({
          subject: record.subject,
        }).collation({
          locale: "en",
          strength: 2,
        })
      ).find((item) =>
        /\bjupeb\b/i.test(item.programme)
      );

      if (!existing) {
        try {
          await Syllabus.create(record);

          inserted++;

          console.log(`Inserted: ${record.subject}`);
        } catch (error) {
          if (error.code !== 11000) {
            throw error;
          }

          console.warn(
            `Duplicate subject skipped: ${record.subject}`
          );
        }

        continue;
      }

      for (const incoming of record.topics) {
        const matches = existing.topics.filter(
          (topic) =>
            normalize(topic.name) ===
            normalize(incoming.name)
        );

        const exact = matches.filter(
          (topic) =>
            normalize(topic.courseCode) ===
            normalize(incoming.courseCode)
        );

        const legacy = matches.filter(
          (topic) => !topic.courseCode
        );

        const repeated =
          record.topics.filter(
            (topic) =>
              normalize(topic.name) ===
              normalize(incoming.name)
          ).length > 1;

        if (
          exact.length > 1 ||
          (
            !exact.length &&
            legacy.length &&
            (repeated || legacy.length > 1)
          )
        ) {
          unresolved++;

          console.warn(
            `Skipped ambiguous topic: ${record.subject} / ${incoming.courseCode} / ${incoming.name}`
          );

          continue;
        }

        const topic = exact[0] || legacy[0];

        if (!topic) {
          existing.topics.push(incoming);
          continue;
        }

        if (!topic.courseCode) {
          topic.courseCode = incoming.courseCode;
        }

        if (!topic.courseTitle) {
          topic.courseTitle = incoming.courseTitle;
        }

        if (!topic.objectives?.length) {
          topic.objectives = incoming.objectives;
        }

        for (const sub of incoming.subtopics || []) {
          const old = topic.subtopics.find(
            (item) =>
              normalize(item.name) ===
              normalize(sub.name)
          );

          if (!old) {
            topic.subtopics.push(sub);
          } else if (!old.objectives?.length) {
            old.objectives = sub.objectives;
          }
        }
      }

      await existing.save();

      merged++;

      console.log(`Merged: ${record.subject}`);
    }

    console.log("\nSeed completed.");
    console.log(`New subjects inserted: ${inserted}`);
    console.log(`Existing subjects merged: ${merged}`);
    console.log(`Unresolved topics: ${unresolved}`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();