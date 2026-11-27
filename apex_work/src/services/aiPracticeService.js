import {studentScope,requireTopic} from "./studentScope.js";
import {questionMathFormat} from "./questionMathFormat.js";
import {providerFailureKind,rateLimitError} from '../utils/aiFailure.js';
import Groq from "groq-sdk";
import {z} from "zod";
import AppError from "../utils/AppError.js";
import StudyPlan from "../models/StudyPlan.js";
import Syllabus from "../models/Syllabus.js";
import AIPractice from "../models/AIPractice.js";
import AcademicProfile from "../models/AcademicProfile.js";
import TopicProgress from "../models/TopicProgress.js";
const questionSchema=z.object({text:z.string().min(8),options:z.array(z.string().min(1)).length(4),correctIndex:z.number().int().min(0).max(3),explanation:z.string().min(1),objective:z.string().optional()});

export function publicAttempt(a){return {_id:a._id,mode:a.mode,plan:a.plan,activity:a.activity,submittedAt:a.submittedAt,score:a.score,questions:a.questions.map(q=>({_id:q._id,text:q.text,options:q.options,objective:q.objective}))};}
export function grade(questions,answers){if(!Array.isArray(answers)||answers.length!==questions.length||answers.some(x=>!Number.isInteger(x)||x<0||x>3))throw new AppError("Answer every question using option 0, 1, 2 or 3",400,"INVALID_ANSWERS");return questions.reduce((n,q,i)=>n+(q.correctIndex===answers[i]?1:0),0);}
async function planFor(user,planId){const plan=await StudyPlan.findOne({_id:planId,user});if(!plan)throw new AppError("Study plan not found",404);return plan;}
async function topicContext(activities){const ids=[...new Set(activities.map(a=>String(a.topic)))];const syllabuses=await Syllabus.find({"topics._id":{$in:ids}});return activities.map(a=>{const found=syllabuses.flatMap(s=>s.topics.map(t=>({subject:s.subject,topic:t}))).find(x=>String(x.topic._id)===String(a.topic));if(!found)return null;return {topicId:String(a.topic),subject:found.subject,topic:found.topic.name,description:found.topic.description,objectives:found.topic.objectives||[],requiredSkills:found.topic.requiredSkills||[],questionTypes:found.topic.questionTypes||[],subtopics:found.topic.subtopics.map(x=>x.name)};}).filter(Boolean);}
// Accept common JSON wrappers and provider markdown fences, then validate locally.
export function normalizeQuestions(raw,count,topics){
 const accepted=[];
 collectQuestions(raw,count,topics,accepted);
 if(accepted.length<count)throw new Error(`Only ${accepted.length} valid unique questions; expected ${count}`);
 return accepted;
}

export function collectQuestions(raw,count,topics,accepted){
 const cleaned=String(raw||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");
 let payload=JSON.parse(cleaned);
 if(Array.isArray(payload))payload={questions:payload};
 const candidates=payload?.questions||payload?.mcqs||payload?.assessment?.questions||payload?.quiz?.questions;
 if(!Array.isArray(candidates))throw new Error("AI did not return a question list");
 const normalized=candidates.map(item=>{const q=item??{};return {
  topicId:q.topicId,
  text:q.text||q.question||"",options:q.options||q.choices||[],
  correctIndex:typeof q.correctIndex==="number"?q.correctIndex:
   typeof q.correct_index==="number"?q.correct_index:
   typeof q.answerIndex==="number"?q.answerIndex:
   /^[A-D]$/i.test(String(q.answer||""))?String(q.answer).toUpperCase().charCodeAt(0)-65:NaN,
  explanation:q.explanation||q.reason||"Review the relevant syllabus objective.",objective:q.objective||""
 }});
 const rejected={invalidFields:0,duplicateOptions:0,duplicateQuestions:0,unknownTopic:0};
 const seen=new Set(accepted.map(q=>q.text.trim().toLowerCase()));
 for(const q of normalized){const valid=questionSchema.safeParse(q);if(!valid.success || q.options.some(x=>!x.trim())){rejected.invalidFields++;continue;}
  if(new Set(q.options.map(o=>o.trim().toLowerCase())).size!==4){rejected.duplicateOptions++;continue;}
  const key=q.text.trim().toLowerCase();if(seen.has(key)){rejected.duplicateQuestions++;continue;}const topic=topics?.length===1 && q.topicId===undefined
    ? topics[0] : topics?.find(t=>String(t.topicId)===q.topicId);
  if(topics && !topic){rejected.unknownTopic++;continue;}
  seen.add(key);
  accepted.push(topic ? {...valid.data,topicId:topic.topicId} : valid.data);
  if(accepted.length===count)break;
 }
 return rejected;
}

async function revisionContext(user,plan){
 // Aggregate across historical plans and recorded syllabus progress, not only the current plan.
 const [history,progress]=await Promise.all([
  StudyPlan.find({user}).sort({updatedAt:-1}).limit(30).lean(),
  TopicProgress.find({user}).sort({updatedAt:-1}).limit(150).lean()
 ]);
 const currentIds=new Set(plan.activities.map(a=>String(a.topic)));
 const ranked=new Map();
 function add(topic,weight){if(!topic)return;const key=String(topic);ranked.set(key,Math.max(weight,ranked.get(key)||0));}
 for(const h of history)for(const a of h.activities||[]){
  if(a.status==="completed"||a.status==="partial")add(a.topic,a.status==="completed"?3:4);
 }
 for(const p of progress){if(p.lectureCovered||p.understanding>0)add(p.topic,p.understanding<=2?5:3);}
 // A topic present in a plan is not automatically proof that it was studied.
 const scope=await studentScope(user);
 const ids=[...ranked].filter(([id])=>scope.topics.has(id)).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id])=>id);
 const syllabus=await Syllabus.find({"topics._id":{$in:ids}}).lean();
 const context=[];
 for(const id of ids){for(const s of syllabus){const t=s.topics.find(t=>String(t._id)===id);if(t){context.push({topicId:id,subject:s.subject,topic:t.name,description:t.description,objectives:t.objectives||[],requiredSkills:t.requiredSkills||[],questionTypes:t.questionTypes||[],subtopics:(t.subtopics||[]).map(x=>x.name)});break;}}}
 return context;
}

export async function createPractice(user,{planId,activityId,mode},requestId){
 const plan=await planFor(user,planId);
 if(!["objective","revision"].includes(mode))throw new AppError("Invalid assessment mode",400);
 let context;
 if(mode==="objective"){
  const activity=plan.activities.id(activityId);
  if(!activity)throw new AppError("Study activity not found",404);
  context=await topicContext([activity]);
 }else context=await revisionContext(user,plan);
 const scope=await studentScope(user);
 context=context.filter(t=>scope.topics.get(t.topicId)===t.subject);
 if(!context.length)throw new AppError(mode==="revision"?"No previously studied topics found. Mark lecture coverage or complete a topic first.":"No matching syllabus topic found",409,"NO_REVIEW_TOPICS");
 if(!process.env.GROQ_API_KEY)throw new AppError("AI assessment service is not configured",503,"AI_NOT_CONFIGURED");
 const profile=await AcademicProfile.findOne({user}).lean();
 const progress=await TopicProgress.find({user,topic:{$in:context.map(x=>x.topicId)}}).lean();
 const count=mode==="revision"?5:10;
 const model=process.env.GROQ_MODEL||"openai/gpt-oss-20b";
 const client=new Groq({apiKey:process.env.GROQ_API_KEY,timeout:20000,maxRetries:0});
 const questions=[];
 let lastError;
 for(let attempt=0;attempt<2;attempt++){
  const missing=count-questions.length;
  const started=Date.now();
  let stage="provider";
  try{
   const completion=await client.chat.completions.create({
    model,temperature:0.15,max_completion_tokens:5000,
    ...(model.startsWith("openai/gpt-oss-")?{include_reasoning:false}:{}),
    response_format:{type:"json_object"},
    messages:[{role:"system",content:`You write personalized OAU JUPEB multiple-choice assessments. Output a single JSON object with a questions array containing exactly ${missing} questions. Each question MUST contain text, options (array of exactly four DISTINCT nonempty strings), correctIndex (integer 0 to 3), explanation (nonempty), objective (string). Do not include markdown. Use ONLY supplied syllabus topics. When several topics are supplied, include the exact matching topicId on each question. In revision mode, distribute questions across prior topics and focus on weak understanding, but do not invent topics. Ensure exactly one correct answer per question. Do not repeat questions. Keep answers hidden in the UI until submission. ${questionMathFormat}`},
     {role:"user",content:JSON.stringify({mode,requiredCount:missing,avoidRepeating:questions.map(q=>q.text),profile:{programme:profile?.programme,subjects:profile?.subjects,goal:profile?.goal,strengths:profile?.strengths,weaknesses:profile?.weaknesses},priorTopicProgress:progress.map(p=>({topicId:String(p.topic),understanding:p.understanding,lectureCovered:p.lectureCovered})),syllabusTopics:context,previousFailure:attempt?"Previous response did not satisfy the exact JSON question schema; ensure all fields and unique questions.":undefined})}]
   });
   stage="question_format";
   const rejected=collectQuestions(completion.choices?.[0]?.message?.content,count,context,questions);
   if(questions.length===count)break;
   console.warn("Practice generation incomplete",{requestId,attempt:attempt+1,accepted:questions.length,required:count,rejected,elapsedMs:Date.now()-started});
  }catch(e){lastError=e;console.warn("Practice generation failed",{requestId,attempt:attempt+1,accepted:questions.length,required:count,kind:stage==="provider"?providerFailureKind(e):stage,status:e.status,elapsedMs:Date.now()-started});if([401,403,429].includes(e?.status))break;}
 }
 if(questions.length!==count){
  if(lastError?.status===401||lastError?.status===403)throw new AppError("Groq authentication failed; check the server API key",503,"AI_AUTH_FAILED");
  if(lastError?.status===429)throw rateLimitError(lastError);
  throw new AppError("AI could not produce a valid assessment after retries. Please try again.",503,"AI_ASSESSMENT_FAILED");
 }
 const saved=await AIPractice.create({user,plan:plan._id,activity:mode==="objective"?activityId:undefined,mode,questions});
 return publicAttempt(saved);
}
export async function submitPractice(user,id,answers){
 const a=await AIPractice.findOne({_id:id,user});
 if(!a)throw new AppError("Assessment not found",404);
 const scope=await studentScope(user);
 for(const q of a.questions)requireTopic(scope,q.topicId);
 if(a.submittedAt)throw new AppError("Assessment already submitted",409);
 const score=grade(a.questions,answers);
 // Compare-and-set prevents two simultaneous requests from overwriting the same attempt.
 const saved=await AIPractice.findOneAndUpdate(
  {_id:id,user,submittedAt:{$exists:false}},
  {$set:{answers,score,submittedAt:new Date()}},
  {new:true,runValidators:true}
 );
 if(!saved)throw new AppError("Assessment already submitted",409);
 return {score,total:a.questions.length,percentage:Math.round(score/a.questions.length*100),review:a.questions.map((q,i)=>({text:q.text,selectedIndex:answers[i],correctIndex:q.correctIndex,correct:answers[i]===q.correctIndex,explanation:q.explanation,objective:q.objective}))};
}
export async function practiceHistory(user,planId){await planFor(user,planId);const attempts=await AIPractice.find({user,plan:planId}).sort({createdAt:-1}).limit(20);const scope=await studentScope(user);return attempts.filter(a=>a.questions.every(q=>scope.topics.has(String(q.topicId)))).map(a=>({id:a._id,mode:a.mode,score:a.score,total:a.questions.length,submittedAt:a.submittedAt,createdAt:a.createdAt}));}
