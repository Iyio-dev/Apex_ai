const asId = value => String(value?._id ?? value);

export function assessmentTotal(record = {}) {
  return record.generatedQuestions?.length || record.questionIds?.length || 0;
}

export function buildLearningStatistics({ relevantSyllabuses = [], topicProgress = [], studyPlans = [], assessments = [] } = {}) {
  const topics = relevantSyllabuses.flatMap(syllabus => syllabus.topics || []);
  const topicIds = new Set(topics.map(topic => asId(topic._id)));
  const progressByTopic = new Map();
  for (const item of topicProgress) {
    const key = asId(item.topic);
    if (topicIds.has(key)) progressByTopic.set(key, item);
  }
  const tracked = [...progressByTopic.values()];
  const covered = relevantSyllabuses.reduce((sum, syllabus) =>
    sum + (syllabus.topics || []).filter(topic => topic.lectureCovered).length, 0);
  const activities = studyPlans.flatMap(plan => plan.activities || []);
  const planned = activities.filter(activity => activity.status !== "skipped");
  const completed = activities.filter(activity => activity.status === "completed").length;
  const scoreHistory = assessments.map(record => ({
    day: record.day,
    score: record.score,
    total: assessmentTotal(record),
    submittedAt: record.submittedAt
  }));
  const understandingTotal = tracked.reduce((sum, item) => sum + (Number(item.understanding) || 0), 0);

  return {
    syllabus: {
      covered,
      total: topics.length,
      percent: topics.length ? Math.round(covered / topics.length * 100) : 0
    },
    learning: {
      tracked: tracked.length,
      total: topics.length,
      mastered: tracked.filter(item => Number(item.understanding) >= 4).length,
      averageUnderstanding: tracked.length ? Math.round(understandingTotal / tracked.length * 10) / 10 : null
    },
    activities: {
      completed,
      planned: planned.length,
      total: activities.length,
      skipped: activities.length - planned.length,
      partial: activities.filter(activity => activity.status === "partial").length,
      scheduled: activities.filter(activity => !activity.status || activity.status === "scheduled").length,
      completionPercent: planned.length ? Math.round(completed / planned.length * 100) : 0
    },
    studyMinutes: activities.reduce((sum, activity) => sum + Math.max(0, Number(activity.actualMinutes) || 0), 0),
    recentScores: scoreHistory,
    topicMastery: tracked.map(item => ({
      topic: item.topic,
      understanding: item.understanding,
      lectureCovered: item.lectureCovered
    }))
  };
}
