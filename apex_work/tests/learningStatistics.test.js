import test from 'node:test';
import assert from 'node:assert/strict';
import { assessmentTotal, buildLearningStatistics } from '../src/services/learningStatistics.js';

const relevantSyllabuses = [{
  subject: 'Mathematics',
  topics: [
    { _id: 'topic-1', lectureCovered: true },
    { _id: 'topic-2', lectureCovered: false }
  ]
}];

test('learning statistics distinguish editor coverage from this student’s topic ratings', () => {
  const stats = buildLearningStatistics({
    relevantSyllabuses,
    topicProgress: [
      { topic: 'topic-1', understanding: 4 },
      { topic: 'topic-2', understanding: 2 },
      { topic: 'removed-topic', understanding: 5 }
    ]
  });

  assert.deepEqual(stats.syllabus, { covered: 1, total: 2, percent: 50 });
  assert.deepEqual(stats.learning, { tracked: 2, total: 2, mastered: 1, averageUnderstanding: 3 });
  assert.equal(stats.topicMastery.length, 2);
});

test('activity totals use actual status counts and logged minutes', () => {
  const stats = buildLearningStatistics({
    studyPlans: [{ activities: [
      { status: 'completed', actualMinutes: 35 },
      { status: 'partial', actualMinutes: 20 },
      { status: 'scheduled', actualMinutes: 0 },
      { status: 'skipped', actualMinutes: 5 }
    ] }]
  });

  assert.deepEqual(stats.activities, {
    completed: 1, planned: 3, total: 4, skipped: 1,
    partial: 1, scheduled: 1, completionPercent: 33
  });
  assert.equal(stats.studyMinutes, 60);
});

test('assessment score denominators follow stored question counts', () => {
  assert.equal(assessmentTotal({ generatedQuestions: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}] }), 10);
  assert.equal(assessmentTotal({ generatedQuestions: [], questionIds: [{}, {}, {}, {}, {}] }), 5);
  const stats = buildLearningStatistics({ assessments: [{ day: '2026-11-24', score: 8, generatedQuestions: Array(10).fill({}) }] });
  assert.deepEqual(stats.recentScores[0], { day: '2026-11-24', score: 8, total: 10, submittedAt: undefined });
});
