import test from 'node:test';
import assert from 'node:assert/strict';
import AcademicProfile from '../src/models/AcademicProfile.js';
import Assessment from '../src/models/Assessment.js';
import Syllabus from '../src/models/Syllabus.js';
import TopicProgress from '../src/models/TopicProgress.js';
import StudyPlan from '../src/models/StudyPlan.js';
import { stats } from '../src/services/academicService.js';

const query = value => ({ lean: async () => value });

test('statistics uses database queries instead of calling lean on async wrappers', async () => {
  const originals = {
    syllabusFind: Syllabus.find,
    progressFind: TopicProgress.find,
    studyPlanFind: StudyPlan.find,
    assessmentFind: Assessment.find,
    profileFindOne: AcademicProfile.findOne
  };

  Syllabus.find = () => query([{
    programme: 'JUPEB', subject: 'Mathematics', topics: [{ _id: 'topic-1', lectureCovered: true }]
  }]);
  TopicProgress.find = () => query([{ topic: 'topic-1', understanding: 4, lectureCovered: true }]);
  StudyPlan.find = () => query([{ activities: [{ status: 'completed', actualMinutes: 40 }] }]);
  Assessment.find = () => ({
    sort() { return this; },
    limit() { return this; },
    lean: async () => [{ day: '2026-11-25', score: 4, generatedQuestions: Array(5).fill({}) }]
  });
  AcademicProfile.findOne = () => query({ programme: 'JUPEB', subjects: ['Mathematics'] });

  try {
    const result = await stats('synthetic-user-id');
    assert.equal(result.syllabus.percent, 100);
    assert.equal(result.learning.mastered, 1);
    assert.equal(result.activities.completed, 1);
    assert.equal(result.studyMinutes, 40);
    assert.equal(result.recentScores[0].total, 5);
  } finally {
    Syllabus.find = originals.syllabusFind;
    TopicProgress.find = originals.progressFind;
    StudyPlan.find = originals.studyPlanFind;
    Assessment.find = originals.assessmentFind;
    AcademicProfile.findOne = originals.profileFindOne;
  }
});
