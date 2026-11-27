import { ApexLoader } from "../../components/ui/ApexLoader";
import { PracticePanel } from "./PracticePanel";
import { ActivityLog } from "../assessment/ActivityLog";
import { AIPlanWizard } from "./AIPlanWizard";
import React, { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, ChartNoAxesCombined, UserRound, BrainCircuit, LogOut, Menu, Plus, ArrowRight, CheckCircle2, Clock3, Target, Trash2, RefreshCw } from "lucide-react";
import { api, errorText } from "../../api";
import { useLoad } from "../../hooks/useLoad";
import { Header } from "../../components/ui/Header";
import { Metric } from "../../components/ui/Metric";
import { Notice } from "../../components/ui/Notice";
import { subjects, dateISO, prettyDate, cls } from "../../lib/format";
export function Plans() {
  const { data, error, loading, refresh } = useLoad("/academic/plans"),
    [days, setDays] = useState(7),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [err, setErr] = useState(""),
    [editing, setEditing] = useState(""), [customizing,setCustomizing]=useState(""),[draft,setDraft]=useState({});
  const plans = data?.results || [];
  const run = async (fn) => {
    setBusy(true);
    setErr("");
    setMessage("");
    try {
      await fn();
      setMessage("Changes saved.");
      refresh();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Header
        title="Study plans"
        subtitle="Create a realistic schedule and log what you actually studied."
        action={
          <div className="flex gap-2 items-center">
            <select
              className="field w-auto"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              {[3, 7, 14, 30].map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </select>
            <button
              className="btn"
              disabled={busy}
              onClick={() =>
                run(() =>
                  api("/academic/plans/generate", {
                    method: "POST",
                    body: { days },
                  }),
                )
              }
            >
              <Plus size={16} className="mr-2" />
              Generate plan
            </button>
          </div>
        }
      />
      <Notice error={error || err} success={message} />
      <AIPlanWizard onCreated={() => { setMessage("Study plan saved."); refresh(); }} />
      {loading ? (
        <ApexLoader message="Loading your study plans" />
      ) : plans.length === 0 ? (
        <div className="panel">
          <p className="font-semibold">No study plans yet</p>
          <p className="muted mt-2">
            Complete your academic profile and syllabus setup, then generate
            your first plan.
          </p>
        </div>
      ) : (
        plans.map((p) => (
          <section key={p._id} className="panel mb-5">
            <div className="flex justify-between items-center gap-3 mb-4">
              <div>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="muted">
                  {p.activities.length} activities · Created{" "}
                  {prettyDate(p.createdAt)}
                </p>
              </div>
              <button
                className="btn-secondary text-rose-600"
                disabled={busy}
                onClick={() => {
                  if (window.confirm("Delete this study plan?"))
                    run(() =>
                      api("/academic/plans/" + p._id, { method: "DELETE" }),
                    );
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <PracticePanel planId={p._id} mode="revision" />
            <div className="space-y-3">
              {p.activities.map((a) => (
                <div
                  key={a._id}
                  className="border border-slate-100 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="muted">
                      {a.subject} · {prettyDate(a.date)} · {a.estimatedMinutes}{" "}
                      min · {a.priority} priority
                    </p>
                  </div>
                  <div className="mt-2 space-y-2">{(a.personalObjectives||[]).length>0&&<div className="text-sm"><strong>Your actionable study steps</strong><ul className="list-disc pl-5">{a.personalObjectives.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}<ActivityObjectives topicId={a.topic}/><PracticePanel planId={p._id} activityId={a._id}/></div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      aria-label="Activity status"
                      className="field w-auto"
                      value={a.status}
                      disabled={busy}
                      onChange={(e) =>
                        run(() =>
                          api(`/academic/plans/${p._id}/activities/${a._id}`, {
                            method: "PATCH",
                            body: { status: e.target.value },
                          }),
                        )
                      }
                    >
                      {["scheduled", "completed", "partial", "skipped"].map(
                        (s) => (
                          <option key={s}>{s}</option>
                        ),
                      )}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
      {data?.pagination?.hasNextPage && (
        <p className="muted">Showing first {plans.length} plans.</p>
      )}
    </>
  );
}

function SessionEditor({activity,onCancel,onSave}){
 const [form,setForm]=useState({title:activity.title,date:dateISO(activity.date),estimatedMinutes:activity.estimatedMinutes,personalSubtopics:activity.personalSubtopics||[],personalObjectives:activity.personalObjectives||[],interestNote:activity.interestNote||""});
 const change=(key,value)=>setForm(f=>({...f,[key]:value}));
 return <div className="w-full apex-topic-card space-y-3" aria-label="Customize study session"><h4 className="font-bold">Personalize this session</h4><label className="block text-sm">Session title<input className="field" value={form.title} onChange={e=>change("title",e.target.value)}/></label><div className="grid sm:grid-cols-2 gap-3"><label className="block text-sm">Study date<input className="field" type="date" value={form.date} onChange={e=>change("date",e.target.value)}/></label><label className="block text-sm">Minutes<input className="field" type="number" min="15" max="240" value={form.estimatedMinutes} onChange={e=>change("estimatedMinutes",Number(e.target.value))}/></label></div><label className="block text-sm">Your subtopics (one per line)<textarea className="field" value={form.personalSubtopics.join("\n")} onChange={e=>change("personalSubtopics",e.target.value.split("\n").filter(Boolean))}/></label><label className="block text-sm">Your actionable study steps (one per line)<textarea className="field" value={form.personalObjectives.join("\n")} onChange={e=>change("personalObjectives",e.target.value.split("\n").filter(Boolean))}/></label><label className="block text-sm">Interests and personal notes<textarea className="field" maxLength={500} value={form.interestNote} onChange={e=>change("interestNote",e.target.value)}/></label><p className="muted text-xs">These are your personal additions; the official syllabus is unchanged.</p><div className="flex gap-2"><button className="btn" onClick={()=>onSave(form)}>Save changes</button><button className="btn-secondary" onClick={onCancel}>Cancel</button></div></div>;
}

function ActivityObjectives({topicId}){
 const [topic,setTopic]=useState(null);
 useEffect(()=>{let active=true;api("/academic/syllabuses").then(list=>{if(active)setTopic((list||[]).flatMap(s=>s.topics||[]).find(t=>String(t._id)===String(topicId))||null);}).catch(()=>{});return()=>{active=false};},[topicId]);
 if(!topic)return null;
 return <div className="text-sm space-y-1">{[ ["What you should achieve",topic.objectives],["Skills you should demonstrate",topic.requiredSkills],["Question competencies",topic.questionTypes]].filter(([,items])=>items?.length).map(([label,items])=><div key={label}><strong>{label}</strong><ul className="list-disc pl-5">{items.map((x,i)=><li key={i}>{x}</li>)}</ul></div>)}</div>;
}
