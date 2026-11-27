import {matchSyllabuses, syllabusDiagnostics} from "./syllabusLookupService.js";
import Syllabus from "../models/Syllabus.js";
import AcademicProfile from "../models/AcademicProfile.js";
import TopicProgress from "../models/TopicProgress.js";
import StudyPlan from "../models/StudyPlan.js";
import AppError from "../utils/AppError.js";
import {dateKey,addCalendarDays,calendarDate} from "../utils/date.js";
import {generateAIStudySchedule} from "./aiStudyPlanService.js";
import {scheduleSessions,fallbackSessions} from "./studyScheduleEngine.js";

export async function planningContext(user){
 const profile=await AcademicProfile.findOne({user});
 if(!profile)throw new AppError("Complete your academic profile first",400,"PROFILE_REQUIRED");
 const [progress,allSyllabuses]=await Promise.all([TopicProgress.find({user}),Syllabus.find().lean()]);
 const syllabuses=matchSyllabuses(allSyllabuses,profile);
 const map=new Map(progress.map(x=>[String(x.topic),x]));
 const topics=syllabuses.flatMap(s=>s.topics.map(t=>({subject:s.subject,topic:t,progress:map.get(String(t._id)),weak:profile.weaknesses.includes(s.subject)||profile.weaknesses.includes(t.name)})));
 return {profile,topics,summary:{syllabusDiagnostics:syllabusDiagnostics(syllabuses,profile),programme:profile.programme,subjects:profile.subjects,goal:profile.goal,examDate:profile.examDate,weeklyHours:profile.weeklyHours,strengths:profile.strengths,weaknesses:profile.weaknesses,topics:topics.map(t=>({id:String(t.topic._id),subject:t.subject,name:t.topic.name,understanding:t.progress?.understanding??null,covered:t.topic.lectureCovered??false,predictedNext:t.topic.predictedNext??false,difficulty:t.topic.difficulty,estimatedHours:t.topic.estimatedHours,subtopics:(t.topic.subtopics||[]).map(s=>s.name),objectives:t.topic.objectives||[],weak:t.weak}))}};
}

export async function createPersonalizedPlan(user,preferences){
 const {profile,topics}=await planningContext(user);
 if(!topics.length)throw new AppError("No syllabus topics available for your subjects",409,"SYLLABUS_REQUIRED");
 if(preferences.focusSubjects?.some(s=>!profile.subjects.includes(s))||preferences.focusTopicIds?.some(id=>!topics.some(t=>String(t.topic._id)===id)))throw new AppError("Choose topics from your four subjects",403);
 const candidates=topics.filter(t=>(!preferences.focusSubjects?.length||preferences.focusSubjects.includes(t.subject))&&(!preferences.focusTopicIds?.length||preferences.focusTopicIds.includes(String(t.topic._id))));
 if(!candidates.length)throw new AppError("No matching topics",409,"NO_TOPICS");
 const requestedMinutes=preferences.minutesPerDay;
 const weeklyMinutes=Math.floor(profile.weeklyHours*60);
 const maxPerDay=Math.min(requestedMinutes,weeklyMinutes);
 if(maxPerDay<15)throw new AppError("Your profile has too few weekly study hours for this schedule",400,"INSUFFICIENT_HOURS");
 const start=dateKey();
 let ai;
 try {
  ai=await generateAIStudySchedule({profile,topics:candidates,preferences:{...preferences,minutesPerDay:maxPerDay}});
 } catch(error) {
  // Do not prevent studying when the AI provider is unavailable.
  console.warn("AI planner fallback:",error.code||"provider unavailable");
 }
 let activities=scheduleSessions({sessions:ai?.sessions||[],candidates,preferences,start,maxPerDay,weeklyMinutes});
 let source="ai";
 if(!activities.length){
  activities=scheduleSessions({sessions:fallbackSessions(candidates,preferences,maxPerDay),candidates,preferences,start,maxPerDay,weeklyMinutes});
  source="rule-based";
 }
 if(!activities.length)throw new AppError("No valid study sessions fit your selected rest days and available hours. Please adjust your preferences.",400,"NO_AVAILABLE_STUDY_TIME");
 return StudyPlan.create({user,name:source==="ai"?ai.title:"Your syllabus study plan",source,preferences,activities:activities.map(({day,...rest})=>({...rest,date:calendarDate(addCalendarDays(start,day))}))});
}
