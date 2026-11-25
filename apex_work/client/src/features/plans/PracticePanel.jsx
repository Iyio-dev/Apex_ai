import {QuestionText} from "../../components/ui/QuestionText";
import {useRetryDelay} from '../../hooks/useRetryDelay';
import React,{useState} from "react";
import {api,errorText} from "../../api";
export function PracticePanel({planId,activityId,mode="objective"}){
 const [attempt,setAttempt]=useState(null),[answers,setAnswers]=useState({}),[result,setResult]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const [wait,handleRateLimit]=useRetryDelay();
 async function start(){
   if(busy || wait>0)return;
   setBusy(true);
   setError("");
   try {
     const next=await api("/academic/practice/generate",{method:"POST",body:{planId,activityId,mode}});
     setAttempt(next);
     setResult(null);
     setAnswers({});
   } catch(e) {
     handleRateLimit(e);
     setError(errorText(e));
   } finally {
     setBusy(false);
   }
 }
 async function submit(){setBusy(true);setError("");try{setResult(await api(`/academic/practice/${attempt._id}/submit`,{method:"POST",body:{answers:attempt.questions.map((_,i)=>answers[i])}}));}catch(e){setError(errorText(e));}finally{setBusy(false);}}
 return <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-3">
 {!attempt&&<button className="btn-secondary" disabled={busy||wait>0} onClick={start}>{wait>0?`Retry in ${wait}s`:busy?"Generating questions…":mode==="revision"?"Take revision test · 5 MCQs":"Take a test · 10 MCQs"}</button>}
 {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
 {attempt&&<><p className="font-semibold">{mode==="revision"?"Past-topic revision":"Learning objective assessment"} · {attempt.questions.length} questions</p>
 {attempt.questions.map((q,i)=><fieldset key={q._id} className="rounded-lg bg-white border p-3 space-y-2" disabled={!!result}><legend className="font-medium px-1">{i+1}. <QuestionText>{q.text}</QuestionText></legend>{q.options.map((option,j)=><label key={j} className="flex gap-2 text-sm items-start"><input type="radio" name={`q-${attempt._id}-${i}`} checked={answers[i]===j} onChange={()=>setAnswers(a=>({...a,[i]:j}))}/><span><QuestionText>{option}</QuestionText></span></label>)}{result&&<div className="text-sm border-t pt-2"><p className={result.review[i].correct?"text-green-700":"text-rose-700"}>{result.review[i].correct?"Correct":"Incorrect"} · Correct answer: <QuestionText>{q.options[result.review[i].correctIndex]}</QuestionText></p><p><QuestionText>{result.review[i].explanation}</QuestionText></p></div>}</fieldset>)}
 {result?<><p className="font-semibold">Score: {result.score}/{attempt.questions.length} ({result.percentage}%)</p><button className="btn-secondary" onClick={start} disabled={busy||wait>0}>{wait>0?`Retry in ${wait}s`:"Try a new test"}</button></>:<button className="btn" onClick={submit} disabled={busy||Object.keys(answers).length!==attempt.questions.length}>{busy?"Marking…":`Submit all ${attempt.questions.length} answers`}</button>}</>}
 </div>;
}
