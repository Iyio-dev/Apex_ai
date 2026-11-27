import { ApexLoader } from "../../components/ui/ApexLoader";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, ClipboardList, Plus, Save, Trash2, RefreshCw, ShieldCheck, ChevronRight, Pencil, X, Search, Layers3, CircleHelp, CheckCircle2 } from "lucide-react";
import { api, errorText } from "../../api";
import { SUBJECTS, cx, Field, Input, Textarea, Select, Button, Alert, Stat } from "./adminUI";
import { useAdminController } from "./useAdminController";
export default function Admin() {
  const { allowed, syllabuses, questions, questionTotal, tab, setTab, syllabusForm, setSyllabusForm, questionForm, setQuestionForm, editingSyllabus, editingQuestion, search, setSearch, loading, saving, error, setError, success, setSuccess, load, topics, filteredSyllabuses, filteredQuestions, resetSyllabus, resetQuestion, editSyllabus, saveSyllabus, deleteSyllabus, editQuestion, saveQuestion, deleteQuestion, updateTopic, addTopic, removeTopic, addSubtopic, updateSubtopic, removeSubtopic } = useAdminController();
  if (loading && allowed === null) return <ApexLoader message="Checking editor access" />;
  if (allowed === false) return <div className="panel max-w-2xl">
    <ShieldCheck className="mb-3 text-rose-600" size={28}/>
    <h2 className="heading">Admin access required</h2>
    <p className="muted mt-2">Sign in with a content editor or administrator account to manage the syllabus.</p>
    <p className="mt-4"><a className="text-indigo-600 font-semibold" href="/">Return to student dashboard</a></p>
  </div>;

  const syllabusEditor = tab === "syllabus-editor";
  const questionEditor = tab === "question-editor";
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"><ShieldCheck size={14}/> CONTENT MANAGEMENT</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Admin dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the academic content students use across APEX.</p>
      </div>
      <Button secondary onClick={load}><RefreshCw size={16}/> Refresh data</Button>
    </div>
    <Alert error={error} success={success}/>
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat icon={BookOpen} label="Subject syllabuses" value={syllabuses.length} note="Programme and subject records"/>
      <Stat icon={Layers3} label="Syllabus topics" value={topics.length} note={`${topics.reduce((n,t)=>n+(t.subtopics||[]).length,0)} nested subtopics`}/>
      <Stat icon={CircleHelp} label="Question bank" value={questionTotal} note={questionTotal>questions.length?`Total entries · first ${questions.length} loaded for search`:`${questionTotal} entries available`}/>
    </div>

    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {[
        ["syllabus","Syllabuses",BookOpen],["questions","Question bank",ClipboardList]
      ].map(([id,label,Icon]) => <button key={id} onClick={()=>{setTab(id);setError("");setSuccess("");}}
        className={cx("inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
          (tab===id || (id==="syllabus"&&syllabusEditor) || (id==="questions"&&questionEditor)) ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100")}>
        <Icon size={16}/>{label}
      </button>)}
    </div>

    {tab === "syllabus" && <section className="panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-lg font-bold text-slate-900">Syllabus library</h2><p className="muted">Create a syllabus for a programme and subject, then add its topics and subtopics.</p></div>
        <Button onClick={()=>{resetSyllabus();setTab("syllabus-editor");}}><Plus size={17}/> Add syllabus</Button>
      </div>
      <div className="relative mb-4"><Search size={17} className="absolute left-3 top-3 text-slate-400"/><input className="field pl-10" placeholder="Search subject or programme…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      {filteredSyllabuses.length ? <div className="space-y-3">
        {filteredSyllabuses.map(s => <div key={s._id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="font-semibold text-slate-900">{s.subject}</div><div className="text-xs text-slate-500">{s.programme} · {s.topics?.length || 0} topics · {(s.topics||[]).reduce((n,t)=>n+(t.subtopics||[]).length,0)} subtopics</div>{s.description&&<p className="mt-2 text-sm text-slate-600">{s.description}</p>}</div>
            <div className="flex gap-2"><Button secondary onClick={()=>editSyllabus(s)}><Pencil size={15}/> Edit</Button><Button danger onClick={()=>deleteSyllabus(s)}><Trash2 size={15}/> Delete</Button></div>
          </div>
          {!!s.topics?.length && <div className="mt-3 flex flex-wrap gap-2">{s.topics.slice(0,8).map(t=><span key={t._id} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{t.name}</span>)}{s.topics.length>8&&<span className="text-xs text-slate-500">+{s.topics.length-8} more</span>}</div>}
        </div>)}
      </div> : <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No syllabus records found. Add your first subject syllabus.</div>}
    </section>}

    {syllabusEditor && <section className="panel">
      <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">{editingSyllabus?"Edit syllabus":"Create syllabus"}</h2><p className="muted">Add the verified programme content students will follow.</p></div><Button secondary onClick={()=>{resetSyllabus();setTab("syllabus");}}><X size={16}/> Close</Button></div>
      <form onSubmit={saveSyllabus} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Programme"><Input required value={syllabusForm.programme} onChange={e=>setSyllabusForm({...syllabusForm,programme:e.target.value})}/></Field>
          <Field label="Subject"><Select value={syllabusForm.subject} onChange={e=>setSyllabusForm({...syllabusForm,subject:e.target.value})}>{SUBJECTS.map(x=><option key={x}>{x}</option>)}</Select></Field>
        </div>
        <Field label="Syllabus description"><Textarea value={syllabusForm.description} onChange={e=>setSyllabusForm({...syllabusForm,description:e.target.value})} placeholder="Describe the syllabus or its source…"/></Field>
        <div className="flex items-center justify-between"><div><h3 className="font-bold">Topics ({syllabusForm.topics.length})</h3><p className="muted">Add each topic and its subtopics.</p></div><Button type="button" secondary onClick={addTopic}><Plus size={15}/> Add topic</Button></div>
        {syllabusForm.topics.map((t,i)=><div key={t._id || `new-${i}`} className="rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-indigo-600">Topic {i+1}</span><button type="button" onClick={()=>removeTopic(i)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="Remove topic"><Trash2 size={16}/></button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Topic name"><Input required value={t.name} onChange={e=>updateTopic(i,{name:e.target.value})} placeholder="e.g. Differentiation"/></Field>
            <Field label="Course grouping"><Select value={t.courseCode || ""} onChange={e=>updateTopic(i,{courseCode:e.target.value})}><option value="">Uncategorized</option>{t.courseCode && !["001","002","003","004"].includes(t.courseCode) && <option value={t.courseCode}>{t.courseCode}</option>}{["001","002","003","004"].map(code=><option key={code} value={code}>{syllabusForm.subject} {code}</option>)}</Select></Field><Field label="Course title"><Input value={t.courseTitle||""} onChange={e=>updateTopic(i,{courseTitle:e.target.value})}/></Field><Field label="Estimated hours"><Input type="number" min="0" step="0.5" value={t.estimatedHours} onChange={e=>updateTopic(i,{estimatedHours:e.target.value})}/></Field>
            <Field label="Difficulty"><Select value={t.difficulty||"medium"} onChange={e=>updateTopic(i,{difficulty:e.target.value})}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></Select></Field>
            <Field label="Description"><Input value={t.description||""} onChange={e=>updateTopic(i,{description:e.target.value})} placeholder="Optional description"/></Field>
          </div>
          <div className="flex flex-wrap gap-5 text-sm"><label className="flex gap-2 items-center"><input type="checkbox" checked={!!t.lectureCovered} onChange={e=>updateTopic(i,{lectureCovered:e.target.checked})}/> Lecturer has covered this topic</label><label className="flex gap-2 items-center"><input type="checkbox" checked={!!t.predictedNext} onChange={e=>updateTopic(i,{predictedNext:e.target.checked})}/> Predicted next / study ahead</label></div>
          <Field label="Official learning objectives (one per line)"><Textarea value={(t.objectives||[]).join("\n")} onChange={e=>updateTopic(i,{objectives:e.target.value.split("\n")})} placeholder="What should students master?"/></Field>
          <Field label="Required skills (one per line)"><Textarea value={(t.requiredSkills||[]).join("\n")} onChange={e=>updateTopic(i,{requiredSkills:e.target.value.split("\n")})} placeholder="What should a student be able to do?"/></Field>
          <Field label="Question types / competencies (one per line)"><Textarea value={(t.questionTypes||[]).join("\n")} onChange={e=>updateTopic(i,{questionTypes:e.target.value.split("\n")})} placeholder="e.g. Apply the chain rule to composite functions"/></Field>
          <div className="rounded-xl bg-slate-50 p-3 space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold">Subtopics ({t.subtopics?.length||0})</span><button type="button" className="text-xs font-semibold text-indigo-600" onClick={()=>addSubtopic(i)}>+ Add subtopic</button></div>
            {(t.subtopics||[]).map((st,j)=><div key={st._id||`sub-${i}-${j}`} className="flex gap-2"><input className="field mt-0" required value={st.name} placeholder="Subtopic name" onChange={e=>updateSubtopic(i,j,{name:e.target.value})}/><textarea className="field" placeholder="Subtopic objectives, one per line" value={(st.objectives||[]).join("\n")} onChange={e=>updateSubtopic(i,j,{objectives:e.target.value.split("\n")})}/><button type="button" onClick={()=>removeSubtopic(i,j)} className="px-2 text-rose-600" aria-label="Remove subtopic"><X size={17}/></button></div>)}
          </div>
        </div>)}
        <div className="flex justify-end gap-2"><Button type="button" secondary onClick={()=>{resetSyllabus();setTab("syllabus");}}>Cancel</Button><Button disabled={saving}><Save size={16}/>{saving?"Saving…":"Save syllabus"}</Button></div>
      </form>
    </section>}

    {tab === "questions" && <section className="panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">Question bank</h2><p className="muted">Create and maintain assessment questions linked to syllabus topics.</p></div><Button onClick={()=>{resetQuestion();setTab("question-editor");}}><Plus size={17}/> Add question</Button></div>
      <div className="relative mb-4"><Search size={17} className="absolute left-3 top-3 text-slate-400"/><input className="field pl-10" placeholder="Search question text, subject or difficulty…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      {filteredQuestions.length ? <div className="space-y-3">{filteredQuestions.map(q=><div key={q._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-md bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">{q.subject}</span><span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">{q.difficulty}</span></div><p className="mt-2 line-clamp-2 text-sm font-medium text-slate-900">{q.text}</p><p className="mt-1 text-xs text-slate-500">Topic ID: {String(q.topic)}</p></div><div className="flex shrink-0 gap-2"><Button secondary onClick={()=>editQuestion(q)}><Pencil size={15}/> Edit</Button><Button danger onClick={()=>deleteQuestion(q)}><Trash2 size={15}/> Delete</Button></div></div>)}</div> : <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No questions found. Add questions after creating the relevant syllabus topics.</div>}
      {questions.length===100&&<p className="mt-4 text-xs text-slate-500">Showing the first 100 questions. Search is limited to the loaded records.</p>}
    </section>}

    {questionEditor && <section className="panel">
      <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">{editingQuestion?"Edit question":"Add question"}</h2><p className="muted">Answers and explanations are stored privately and not exposed before submission.</p></div><Button secondary onClick={()=>{resetQuestion();setTab("questions");}}><X size={16}/> Close</Button></div>
      <form onSubmit={saveQuestion} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Subject"><Select value={questionForm.subject} onChange={e=>setQuestionForm({...questionForm,subject:e.target.value,topic:""})}>{SUBJECTS.map(x=><option key={x}>{x}</option>)}</Select></Field>
          <Field label="Topic"><Select required value={questionForm.topic} onChange={e=>setQuestionForm({...questionForm,topic:e.target.value})}><option value="">Choose a topic</option>{topics.filter(t=>t.subject===questionForm.subject).map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</Select></Field>
        </div>
        <Field label="Question text"><Textarea required value={questionForm.text} onChange={e=>setQuestionForm({...questionForm,text:e.target.value})} placeholder="Enter the question…"/></Field>
        <div><div className="mb-2 text-sm font-semibold">Answer options</div><div className="grid gap-3 sm:grid-cols-2">{questionForm.options.map((option,i)=><Field key={i} label={`Option ${String.fromCharCode(65+i)}`}><Input value={option} onChange={e=>setQuestionForm({...questionForm,options:questionForm.options.map((x,j)=>j===i?e.target.value:x)})} placeholder={`Option ${String.fromCharCode(65+i)}`}/></Field>)}</div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Correct answer" hint="Enter the exact option text, not its letter."><Input required value={questionForm.correctAnswer} onChange={e=>setQuestionForm({...questionForm,correctAnswer:e.target.value})} placeholder="Exact correct option"/></Field>
          <Field label="Difficulty"><Select value={questionForm.difficulty} onChange={e=>setQuestionForm({...questionForm,difficulty:e.target.value})}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></Select></Field>
        </div>
        <Field label="Explanation"><Textarea value={questionForm.explanation} onChange={e=>setQuestionForm({...questionForm,explanation:e.target.value})} placeholder="Explain why the answer is correct…"/></Field>
        <div className="flex justify-end gap-2"><Button type="button" secondary onClick={()=>{resetQuestion();setTab("questions");}}>Cancel</Button><Button disabled={saving}><Save size={16}/>{saving?"Saving…":"Save question"}</Button></div>
      </form>
    </section>}
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <strong>Content integrity:</strong> Enter only verified syllabus material and reviewed questions. Deleting topics or questions can affect existing student progress and assessment records; prefer editing content rather than deleting records already used by students.
    </div>
  </div>;
}
