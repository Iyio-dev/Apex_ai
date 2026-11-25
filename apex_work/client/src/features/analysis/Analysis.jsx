import {useRetryDelay} from '../../hooks/useRetryDelay';
import React, {useEffect,useState} from 'react';
import {BrainCircuit,ArrowLeft,ArrowRight} from 'lucide-react';
import {api,errorText} from '../../api';
import {Header} from '../../components/ui/Header';
import {Notice} from '../../components/ui/Notice';

const sections=[['start','Start'],['stop','Stop'],['reduce','Reduce'],['reinforce','Reinforce']];
export function Analysis(){
 const [questions,setQuestions]=useState([]);
 const [answers,setAnswers]=useState({});
 const [step,setStep]=useState(0);
 const [overview,setOverview]=useState(null);
 const [busy,setBusy]=useState(false);
 const [retry,setRetry]=useState(false);
 const [wait,handleRateLimit]=useRetryDelay();
 const [error,setError]=useState('');
 useEffect(()=>{let active=true;Promise.all([api('/academic/overview/context'),api('/academic/overview/latest')]).then(([ctx,last])=>{if(active){setQuestions(ctx.questions);setOverview(last?.overview||null);}}).catch(e=>{if(active)setError(errorText(e));});return()=>{active=false;};},[]);
 const generate=async()=>{if(busy||wait>0)return;setBusy(true);setError('');try{const result=await api('/academic/overview/generate',{method:'POST',body:answers});setOverview(result.overview);setRetry(false);}catch(e){setError(errorText(e));setRetry(true);handleRateLimit(e);}finally{setBusy(false);}};
 const question=questions[step];
 return <>
  <Header title="AI academic overview" subtitle="Personalized Start, Stop, Reduce and Reinforce guidance grounded in your academic records."/>
  <Notice error={error}/>
  <section className="panel space-y-4">
   <p className="muted">APEX reviews your academic profile, topic progress, assessments and study plans. Answer five questions to add the context that your records cannot show. Your academic context and answers are sent to the configured Groq AI provider when you generate an overview. Avoid including sensitive personal details.</p>
   {question&&<div className="space-y-3">
    <p className="font-semibold">Question {step+1} of {questions.length}</p>
    <label htmlFor="overview-answer" className="block font-medium">{question.question}</label>
    <textarea id="overview-answer" className="w-full rounded-lg border p-3 bg-transparent" rows={3} maxLength={400} value={answers[question.id]||''} onChange={e=>setAnswers(a=>({...a,[question.id]:e.target.value}))}/>
    <div className="flex gap-3 flex-wrap">
     <button className="btn" type="button" disabled={step===0||busy} onClick={()=>setStep(s=>s-1)}><ArrowLeft size={16}/> Back</button>
     {step<questions.length-1?<button className="btn" type="button" disabled={(answers[question.id]||'').trim().length<5} onClick={()=>setStep(s=>s+1)}>Next <ArrowRight size={16}/></button>:<button className="btn" type="button" disabled={busy||wait>0||questions.some(q=>(answers[q.id]||'').trim().length<5)} onClick={generate}><BrainCircuit size={16}/> {busy?'Generating…':wait>0?`Retry in ${wait}s`:retry?'Retry overview':'Generate my overview'}</button>}
    </div>
   </div>}
  </section>
  {overview&&<section className="mt-5 space-y-4" aria-label="Your academic overview">
   <div className="panel"><h2 className="font-bold mb-2">Your academic picture</h2><p>{overview.summary}</p></div>
   <div className="grid md:grid-cols-2 gap-4">{sections.map(([key,title])=><section className="panel" key={key}><h2 className="font-bold text-lg mb-3">{title}</h2><div className="space-y-4">{(overview[key]||[]).map((item,i)=><article key={i} className="space-y-1"><h3 className="font-semibold">{item.action}</h3><p>{item.reason}</p><p><strong>First step:</strong> {item.firstStep}</p><p className="muted text-sm"><strong>Evidence:</strong> {item.evidence}</p></article>)}</div></section>)}</div>
  </section>}
 </>;
}
