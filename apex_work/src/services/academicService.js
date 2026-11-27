import {coveredScope, coveredProfileTopics} from "./curriculumScope.js";
import {findStudentSyllabuses, matchSyllabuses} from "./syllabusLookupService.js";
import {studentScope,scopedPlan,scopedAssessment,requireTopic} from "./studentScope.js";
import mongoose from "mongoose";
import AcademicProfile from "../models/AcademicProfile.js";
import Syllabus from "../models/Syllabus.js";
import TopicProgress from "../models/TopicProgress.js";
import StudyPlan from "../models/StudyPlan.js";
import Question from "../models/Question.js";
import Assessment from "../models/Assessment.js";
import AppError from "../utils/AppError.js";
import validateObjectId from "../utils/validateObjectId.js";
import { paginateQuery } from "../utils/paginateQuery.js";
import { dateKey, inputDateKey, addCalendarDays, calendarDate } from "../utils/date.js";
import { assessmentTotal, buildLearningStatistics } from "./learningStatistics.js";
const bad = (message, status = 400) => { throw new AppError(message, status) };
const owned = async (Model, user, id) => { validateObjectId(id); const doc = await Model.findOne({ _id: id, user }); if (!doc) bad("Record not found", 404); return doc };
export const profile = async user => AcademicProfile.findOne({ user });
export const saveProfile = async (user, data) => {
 const previous=await profile(user);const selected=data.subjects??previous?.subjects;
 if(!selected||selected.length!==4||new Set(selected).size!==4)bad("Select exactly four distinct subjects");
 const records=await findStudentSyllabuses({programme:data.programme??previous?.programme??"OAU JUPEB",subjects:selected});
 
 const patch={...data,strengths:coveredProfileTopics(records,data.strengths??previous?.strengths??[]),weaknesses:coveredProfileTopics(records,data.weaknesses??previous?.weaknesses??[])};
 return AcademicProfile.findOneAndUpdate({user},{$set:patch},{upsert:true,new:true,runValidators:true,setDefaultsOnInsert:true});
};
export const previewSyllabuses = async (data) => coveredScope(await findStudentSyllabuses({programme:data.programme??"OAU JUPEB",subjects:data.subjects??[]})).records;
export const syllabuses = async (user,editor=false) => editor?Syllabus.find():(await studentScope(user)).records;
export const saveSyllabus = async data => Syllabus.findOneAndUpdate({ programme: data.programme, subject: data.subject }, { $set: data }, { new: true, upsert: true, runValidators: true });
export const getSyllabus = async (id,user,editor=false) => { validateObjectId(id); const doc = await Syllabus.findById(id); if (!doc || (user&&!editor&&!(await studentScope(user)).records.some(s=>String(s._id)===String(id)))) bad("Syllabus not found", 404); return user&&!editor?{...doc.toObject(),topics:doc.topics.filter(t=>t.lectureCovered===true)}:doc };
export const updateSyllabus = async (id, data) => { const doc = await getSyllabus(id); Object.assign(doc, data); return doc.save() };
export const deleteSyllabus = async id => { const doc = await getSyllabus(id); await doc.deleteOne(); return doc };
export const findTopic = async id => { validateObjectId(id, "topic ID"); const syllabus = await Syllabus.findOne({ "topics._id": id }); if (!syllabus) bad("Topic not found", 404); return { syllabus, topic: syllabus.topics.id(id) } };
export const progress = async user => TopicProgress.find({ user,topic:{$in:[...(await studentScope(user)).topics.keys()]} });
export const setProgress = async (user, id, data) => { const { syllabus } = await findTopic(id); requireTopic(await studentScope(user),id,syllabus.subject); return TopicProgress.findOneAndUpdate({ user, topic: id }, { $set: { understanding: data.understanding, subject: syllabus.subject } }, { new: true, upsert: true, runValidators: true }) };
export const plans = async (user, options) => {const scope=await studentScope(user);const page=await paginateQuery({model:StudyPlan,filter:{user},options});return {...page,results:page.results.map(p=>scopedPlan(scope,p.toObject()))};};
export const plan = async (user, id) => owned(StudyPlan, user, id);
export const visiblePlan=async(user,id)=>scopedPlan(await studentScope(user),(await plan(user,id)).toObject());
const checkActivities = async (user,activities) => { const scope=await studentScope(user); for (const a of activities) { requireTopic(scope,a.topic,a.subject); const { syllabus } = await findTopic(a.topic); if (syllabus.subject !== a.subject) bad("Activity subject does not match topic") } };
export const createPlan = async (user, data) => { await checkActivities(user,data.activities); return StudyPlan.create({ ...data, user }) };
export const updatePlan = async (user, id, data) => { const doc = await plan(user, id); if(data.activities) await checkActivities(user,data.activities); Object.assign(doc, data); await doc.save(); return visiblePlan(user,id) };
export const removePlan = async (user, id) => { const doc = await plan(user, id); await doc.deleteOne() };
export const addActivity = async (user, id, data) => { await checkActivities(user,[data]); const doc = await plan(user, id); doc.activities.push(data); await doc.save(); return doc.activities.at(-1) };
export const changeActivity = async (user, id, activityId, data) => { validateObjectId(activityId); const doc = await plan(user, id); const a = doc.activities.id(activityId); if (!a) bad("Activity not found", 404); await checkActivities(user,[{ ...a.toObject(), ...data }]); Object.assign(a, data); await doc.save(); return a };
export const removeActivity = async (user, id, activityId) => { validateObjectId(activityId); const doc = await plan(user, id); const a = doc.activities.id(activityId); if (!a) bad("Activity not found", 404); a.deleteOne(); await doc.save() };
export const generatePlan = async (user, { days = 7, startDate }) => { const p = await profile(user); if (!p) bad("Create an academic profile first"); const all = await findStudentSyllabuses(p); const covered = await progress(user); const map = new Map(covered.map(x => [String(x.topic), x])); const topics = all.flatMap(s => s.topics.filter(t=>t.lectureCovered===true).map(t => ({ subject: s.subject, topic: t, progress: map.get(String(t._id)) }))).filter(x => !x.progress?.lectureCovered || x.progress.understanding < 3); topics.sort((a, b) => Number(p.weaknesses.includes(b.subject) || p.weaknesses.includes(b.topic.name)) - Number(p.weaknesses.includes(a.subject) || p.weaknesses.includes(a.topic.name)) || (a.progress?.understanding ?? 0) - (b.progress?.understanding ?? 0)); const dailyMinutes = Math.floor(p.weeklyHours * 60 / 7); const activities = []; let index = 0; const firstDay = startDate ? inputDateKey(startDate) : dateKey(); for (let d = 0; d < days && index < topics.length; d++) { let remaining = dailyMinutes; while (remaining >= 15 && index < topics.length) { const t = topics[index++]; const duration = Math.min(remaining, Math.max(15, Math.round(t.topic.estimatedHours * 60))); const day = addCalendarDays(firstDay, d); activities.push({ subject: t.subject, topic: t.topic._id, title: `Study ${t.topic.name}`, date: calendarDate(day), estimatedMinutes: duration, priority: p.weaknesses.includes(t.subject) || p.weaknesses.includes(t.topic.name) ? "high" : "medium" }); remaining -= duration } } return createPlan(user, { name: `Personalized ${days}-day plan`, activities }) };
export const questions = async (options,user,editor=false) => paginateQuery({ model: Question, options,filter:editor?{}:{topic:{$in:[...(await studentScope(user)).topics.keys()]}} });
export const question = async (id,user,editor=false) => { validateObjectId(id); const q = await Question.findById(id).select("+correctAnswer +explanation"); if (!q) bad("Question not found", 404); if(user&&!editor)requireTopic(await studentScope(user),q.topic,q.subject); return q };
export const createQuestion = async data => { const { syllabus } = await findTopic(data.topic); if (syllabus.subject !== data.subject) bad("Question subject does not match topic"); return Question.create(data) };
export const updateQuestion = async (id, data) => { const q = await question(id); if (data.topic || data.subject) { const { syllabus } = await findTopic(data.topic || q.topic); if (syllabus.subject !== (data.subject || q.subject)) bad("Question subject does not match topic") } Object.assign(q, data); return q.save() };
export const deleteQuestion = async id => { const q = await question(id); await q.deleteOne() };
const dayKey = (date = new Date()) => dateKey(date);
// Daily questions are generated for this student; admin question-bank entries are not used.
export { daily, submit } from "./dailyAssessmentService.js";
export const results = async (user, options) => {
  const scope=await studentScope(user);
  const page = await paginateQuery({ model: Assessment, filter: { user, submittedAt: { $exists: true }, "generatedQuestions.0":{$exists:true}, generatedQuestions:{$not:{$elemMatch:{topicId:{$nin:[...scope.topics.keys()]}}}} }, options });
  return {
    ...page,
    results: page.results.filter(a=>scopedAssessment(scope,a)).map(record => ({
      id: record._id,
      day: record.day,
      score: record.score,
      total: record.generatedQuestions?.length || record.questionIds?.length || 0,
      submittedAt: record.submittedAt,
      createdAt: record.createdAt,
    })),
  };
};
export const stats = async user => {
 const [all, prog, ps, assessments, p] = await Promise.all([
  Syllabus.find().lean(), TopicProgress.find({ user }).lean(), StudyPlan.find({ user }).lean(),
  Assessment.find({ user, submittedAt: { $exists: true } }).sort({ submittedAt: -1 }).limit(10).lean(), AcademicProfile.findOne({ user }).lean()
 ]);
 const relevant = p ? matchSyllabuses(all, p) : [];
 const scope=coveredScope(relevant);
 return buildLearningStatistics({relevantSyllabuses:relevant,topicProgress:prog.filter(p=>scope.topics.has(String(p.topic))),studyPlans:ps.map(p=>scopedPlan(scope,p)),assessments:assessments.filter(a=>scopedAssessment(scope,a))});
};
export const dashboard = async user => {
 const today = dayKey();
 const [ps, record, progressStats] = await Promise.all([
  StudyPlan.find({ user }).sort({ createdAt: -1 }),
  Assessment.findOne({user,day:today}).select("day score submittedAt generatedQuestions questionIds").lean(),
  stats(user)
 ]);
 const scope=await studentScope(user);
 const visible=ps.map(p=>scopedPlan(scope,p.toObject()));
 const assessment = record && scopedAssessment(scope,record) ? {
  day: record.day,
  score: record.submittedAt ? record.score : undefined,
  total: assessmentTotal(record),
  submitted: !!record.submittedAt
 } : null;
 return { currentPlan: visible[0] || null, todaysActivities: visible.flatMap(p => p.activities.filter(a => dayKey(a.date) === today).map(a => ({ ...a, planId: p._id }))), assessment, progress: progressStats };
};
export const reschedule = async (user, id, activityId, date) => changeActivity(user, id, activityId, { date, status: "scheduled" });
