import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "node:fs/promises";

import Syllabus from "../src/models/Syllabus.js";

dotenv.config();

const subjects = ["chemistry", "mathematics", "physics"];

async function importSyllabuses() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const subject of subjects) {
      const file = new URL(
        `../data/syllabuses/${subject}.json`,
        import.meta.url
      );

      const content = await fs.readFile(file, "utf8");
      const syllabus = JSON.parse(content);

      if (!syllabus.programme || !syllabus.subject) {
        throw new Error(`Invalid syllabus file: ${subject}.json`);
      }

      const existing = await Syllabus.findOne({
        programme: syllabus.programme,
        subject: syllabus.subject
      });

      if (existing) {
        console.log(`${syllabus.subject} already exists. Skipping.`);
        continue;
      }

      await Syllabus.create(syllabus);
      console.log(`${syllabus.subject} imported successfully`);
    }

    console.log("Import process completed");
  } catch (error) {
    console.error("Import failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

importSyllabuses();