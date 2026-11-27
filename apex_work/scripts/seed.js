import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import Syllabus from '../src/models/Syllabus.js';

dotenv.config();
const apply = process.argv.includes('--apply');

async function seed() {
  try {
    const records = JSON.parse(await fs.readFile(new URL('./seed.json', import.meta.url), 'utf8'));
    if (!Array.isArray(records) || !records.length) throw new Error('Expected a nonempty array in seed.json');
    const seen = new Set();
    for (const record of records) {
      const doc = new Syllabus(record);
      await doc.validate();
      const key = `${doc.programme}:${doc.subject}`.toLowerCase();
      if (seen.has(key)) throw new Error(`Duplicate subject: ${doc.subject}`);
      seen.add(key);
      if (!doc.topics.length || doc.topics.some(t => !t.courseCode || !t.objectives?.length || t.subtopics.some(s => !s.objectives?.length))) {
        throw new Error(`Missing curriculum fields for ${doc.subject}. Install the updated Syllabus model.`);
      }
    }
    console.log(`Validated ${records.length} subjects.`);
    if (!apply) {
      console.log('No database changes. Run with --apply to import.');
      return;
    }
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing from .env');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to database: ${mongoose.connection.name}`);
    await Syllabus.init();
    let inserted = 0, skipped = 0;
    for (const record of records) {
      const filter = { programme: record.programme, subject: record.subject };
      const existing = (await Syllabus.find({subject:record.subject}).collation({locale:"en",strength:2})).find(s=>/\bjupeb\b/i.test(s.programme));
      if (existing) {
        // Preserve existing IDs, lecturer flags, and all unmatched topics/subtopics.
        const key = value => String(value).trim().toLowerCase();
        for (const incoming of record.topics) {
          const matches = existing.topics.filter(t => key(t.name) === key(incoming.name));
          if (matches.length > 1) throw new Error(`Ambiguous topic: ${incoming.name}`);
          const topic = matches[0];
          if (!topic) { existing.topics.push(incoming); continue; }
          if (!topic.courseCode) topic.courseCode = incoming.courseCode;
          if (!topic.courseTitle) topic.courseTitle = incoming.courseTitle;
          if (!topic.objectives.length) topic.objectives = incoming.objectives;
          for (const sub of incoming.subtopics) {
            const old = topic.subtopics.find(s => key(s.name) === key(sub.name));
            if (!old) topic.subtopics.push(sub);
            else if (!old.objectives.length) old.objectives = sub.objectives;
          }
        }
        await existing.save();
        skipped++; console.log(`Merged: ${record.subject}`); continue;
      }
      try {
        await Syllabus.create(record);
        inserted++;
        console.log(`Inserted: ${record.subject}`);
      } catch (error) {
        if (error.code !== 11000) throw error;
        skipped++;
        console.log(`Skipped duplicate: ${record.subject}`);
      }
    }
    console.log(`Finished: ${inserted} inserted, ${skipped} existing/merged.`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
seed();
