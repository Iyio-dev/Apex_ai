import asyncHandler from "../utils/asyncHandler.js";
import * as s from "../services/academicService.js";
import { analyzeAcademicProfile } from "../services/aiService.js";
import AppError from "../utils/AppError.js";

export const handle = (fn, status = 200) =>
  asyncHandler(async (req, res) => {
    const result = await fn(req, res);
    res.status(status).json({ success: true, data: result ?? null });
  });
export const analyze = handle(async (req) => {
  const profile = await s.profile(req.user._id);
  if (!profile) throw new AppError("Create an academic profile first", 400);
  return analyzeAcademicProfile({
    profile: {
      programme: profile.programme, subjects: profile.subjects, goal: profile.goal,
      weeklyHours: profile.weeklyHours, strengths: profile.strengths, weaknesses: profile.weaknesses,
    },
    statistics: await s.stats(req.user._id).then(({topicMastery, ...summary}) => ({
      ...summary, topicMastery: topicMastery.map(({understanding, lectureCovered}) => ({understanding, lectureCovered})),
    })),
  });
});
