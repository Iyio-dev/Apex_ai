import {questionMathFormat} from "./questionMathFormat.js";
import {providerFailureKind} from "../utils/aiFailure.js";
import {studentScope,scopedAssessment} from "./studentScope.js";
import {findStudentSyllabuses, matchSyllabuses} from "./syllabusLookupService.js";
import Groq from "groq-sdk";
import AcademicProfile from "../models/AcademicProfile.js";
import Assessment from "../models/Assessment.js";
import Syllabus from "../models/Syllabus.js";
import TopicProgress from "../models/TopicProgress.js";
import StudyPlan from "../models/StudyPlan.js";
import AppError from "../utils/AppError.js";
import {dateKey} from "../utils/date.js";
import {normalizeQuestions} from "./aiPracticeService.js";

const id = x => String(x);
export function selectDailyTopics({profile,syllabuses,progress,plans},limit=5){
 const progressMap=new Map(progress.map(x=>[id(x.topic),x]));
 const planned=new Set(plans.flatMap(p=>(p.activities||[]).filter(a=>a.status!=="skipped").map(a=>id(a.topic))));
 const topics=syllabuses.flatMap(s=>(s.topics||[]).map(t=>({
  topicId:id(t._id),subject:s.subject,topic:t.name,description:t.description||"",
  objectives:t.objectives||[],requiredSkills:t.requiredSkills||[],subtopics:(t.subtopics||[]).map(x=>({name:x.name,objectives:x.objectives||[]})),
  lectureCovered:t.lectureCovered,progress:progressMap.get(id(t._id)),inPlan:planned.has(id(t._id)),
  weak:(profile.weaknesses||[]).some(w=>[s.subject,t.name].some(n=>n.toLowerCase()===String(w).toLowerCase()))
 })));
 const eligible=topics;
 eligible.sort((a,b)=>score(b)-score(a));
 return eligible.slice(0,limit);
 function score(t){return (t.weak?8:0)+(t.inPlan?6:0)+(t.lectureCovered?3:0)+(t.progress?.understanding>0?(6-t.progress.understanding)*2:0);}
}
export function publicDaily(a){const questions=a.generatedQuestions||[];return {day:a.day,submitted:!!a.submittedAt,score:a.submittedAt?a.score:undefined,total:questions.length||a.questionIds?.length||0,questions:a.submittedAt?[]:questions.map((q,i)=>({_id:String(i),subject:q.subject,topic:q.topic,text:q.text,options:q.options}))};}
export async function daily(user,day=dateKey(),requestId){
 let record=await Assessment.findOne({user,day});
 if(record){if(!scopedAssessment(await studentScope(user),record))throw new AppError("Today’s assessment belongs to a previous subject selection. A new assessment will be available tomorrow.",409);if(!record.generatedQuestions?.length)throw new AppError("An older question-bank assessment exists for today. AI-generated daily assessments begin tomorrow.",409);return publicDaily(record);}
 const profile=await AcademicProfile.findOne({user}).lean();
 if(!profile)throw new AppError("Create an academic profile first",400);
 const [syllabuses,progress,plans]=await Promise.all([
  findStudentSyllabuses(profile),
  TopicProgress.find({user}).lean(),StudyPlan.find({user}).sort({createdAt:-1}).limit(5).lean()
 ]);
 const topics=selectDailyTopics({profile,syllabuses,progress,plans});
 if(!topics.length)throw new AppError("Add covered syllabus topics or create a study plan before taking today's assessment.",409);
 if(!process.env.GROQ_API_KEY)throw new AppError("Groq AI is not configured",503);
 const model=process.env.GROQ_MODEL||"openai/gpt-oss-20b";
 const client=new Groq({apiKey:process.env.GROQ_API_KEY,timeout:20000,maxRetries:0});
 let generated,lastError;
 for(let attempt=0;attempt<2;attempt++){
  const started=Date.now();
  let stage="provider";
  try{
   const completion=await client.chat.completions.create({model,temperature:0.2,max_completion_tokens:5000,...(model.startsWith("openai/gpt-oss-")?{include_reasoning:false}:{}),response_format:{type:"json_object"},messages:[
    {role:"system",content:"Create exactly five original, academically accurate OAU JUPEB MCQs based ONLY on the provided student syllabus topics. Personalize the balance toward weak topics and the current plan. Return JSON object {questions:[{topicId,text,options:[four distinct answers],correctIndex:0-3,explanation,objective}]}. Copy each question’s matching topicId exactly from the supplied topics. Each item must have one unambiguously correct answer. Do not return markdown. Distribute questions across supplied topics where possible. Never reveal correct answers in question text. "+questionMathFormat},
    {role:"user",content:JSON.stringify({programme:profile.programme,goal:profile.goal,weaknesses:profile.weaknesses,strengths:profile.strengths,topics:topics.map(t=>({topicId:t.topicId,subject:t.subject,topic:t.topic,description:t.description,objectives:t.objectives,requiredSkills:t.requiredSkills,subtopics:t.subtopics,understanding:t.progress?.understanding,inCurrentPlan:t.inPlan})),retry:attempt>0?"Previous response was invalid; return five complete unique MCQs":undefined})}
   ]});
   stage="question_validation";
   generated=normalizeQuestions(completion.choices?.[0]?.message?.content,5,topics);break;
  }catch(e){
   lastError=e;
   console.warn("Daily assessment generation failed",{
    requestId,attempt:attempt+1,kind:stage==="provider"?providerFailureKind(e):"invalid_or_unusable_questions",
    status:Number.isInteger(e?.status)?e.status:undefined,elapsedMs:Date.now()-started
   });
   if([401,403,429].includes(e?.status))break;
  }
 }
 if(!generated)throw new AppError(lastError?.status===429?"AI is rate limited; please try later":lastError?.status===401?"AI authentication failed":"Unable to generate a valid personalized daily assessment. Please try again later.",lastError?.status===429?429:503);
 const questions=generated.map(question=>{
  const topic=topics.find(t=>t.topicId===question.topicId);
  return {...question,subject:topic.subject,topic:topic.topic};
 });
 try{record=await Assessment.create({user,day,source:"ai",generatedQuestions:questions});}
 catch(e){if(e.code!==11000)throw e;record=await Assessment.findOne({user,day});}
 if(!scopedAssessment(await studentScope(user),record))throw new AppError("Subject selection changed. Please try again tomorrow.",409);
 return publicDaily(record);
}
export async function submit(user,{answers}){
 const record=await Assessment.findOne({user,day:dateKey()});
 if(!record)throw new AppError("Request today's assessment first",404);
 if(!scopedAssessment(await studentScope(user),record))throw new AppError("Assessment is outside your current subjects",403);
 if(record.submittedAt)throw new AppError("Already submitted",409);
 const qs=record.generatedQuestions;
 if(qs.length!==5||answers.length!==5||new Set(answers.map(a=>a.question)).size!==5||answers.some(a=>!/^[0-4]$/.test(a.question)))throw new AppError("Submit answers for all five questions",400);
 const ordered=[...answers].sort((a,b)=>Number(a.question)-Number(b.question));
 const results=ordered.map((a,i)=>{const index=qs[i].options.findIndex(o=>o.trim()===a.answer.trim());if(index<0)throw new AppError("Invalid answer option",400);return {question:a.question,answer:a.answer,correct:index===qs[i].correctIndex};});
 const score=results.filter(x=>x.correct).length;
 // Only the first submission wins, including under concurrent requests.
 const saved=await Assessment.findOneAndUpdate(
  {_id:record._id,user,submittedAt:{$exists:false}},
  {$set:{answers:results.map(a=>({answer:a.answer,correct:a.correct})),score,submittedAt:new Date()}},
  {new:true,runValidators:true}
 );
 if(!saved)throw new AppError("Already submitted",409);
 return {score,total:5,answers:results.map((a,i)=>({...a,correctAnswer:qs[i].options[qs[i].correctIndex],explanation:qs[i].explanation,topic:qs[i].topic}))};
}
