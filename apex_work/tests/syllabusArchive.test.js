import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const archive = JSON.parse(await readFile(new URL('../data/syllabus-archive.json', import.meta.url), 'utf8'));

test('archive covers all APEX syllabus subjects and matches the Syllabus model shape', () => {
  assert.deepEqual(archive.map((item) => item.subject).sort(), ['Biology', 'Chemistry', 'Mathematics', 'Physics']);
  for (const record of archive) {
    assert.equal(record.programme, 'OAU JUPEB');
    assert.ok(record.topics.length > 0);
    for (const topic of record.topics) {
      assert.ok(topic.name);
      assert.ok(topic.courseCode);
      assert.ok(['easy', 'medium', 'hard'].includes(topic.difficulty));
      assert.ok(topic.estimatedHours > 0);
      assert.equal(topic.lectureCovered, false);
      assert.equal(topic.predictedNext, false);
      assert.ok(topic.objectives.length > 0);
      assert.ok(topic.requiredSkills.length > 0);
      assert.ok(topic.questionTypes.length > 0);
      assert.ok(topic.subtopics.length > 0);
      assert.ok(topic.objectives.every((objective) => objective.length <= 240));
    }
  }
});
