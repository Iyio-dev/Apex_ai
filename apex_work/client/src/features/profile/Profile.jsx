import { ApexLoader } from "../../components/ui/ApexLoader";
import React, { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, ChartNoAxesCombined, UserRound, BrainCircuit, LogOut, Menu, Plus, ArrowRight, CheckCircle2, Clock3, Target, Trash2, RefreshCw } from "lucide-react";
import { api, errorText } from "../../api";
import { useLoad } from "../../hooks/useLoad";
import { Header } from "../../components/ui/Header";
import { Metric } from "../../components/ui/Metric";
import { Notice } from "../../components/ui/Notice";
import { subjects, dateISO, prettyDate, cls } from "../../lib/format";
export function Profile() {
  const { data, loading, refresh } = useLoad("/academic/profile"),
    { data: syllabusRecords, refresh: refreshSyllabuses } = useLoad("/academic/syllabuses"),
    [form, setForm] = useState({
      programme: "OAU JUPEB",
      subjects: [],
      goal: "",
      weeklyHours: 14,
      strengths: [],
      weaknesses: [],
    }),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (data)
      setForm({
        programme: data.programme || "OAU JUPEB",
        subjects: data.subjects || [],
        goal: data.goal || "",
        weeklyHours: data.weeklyHours ?? 14,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
      });
  }, [data]);
  const availableTopics = (Array.isArray(syllabusRecords) ? syllabusRecords : [])
    .flatMap(s => (s.topics || []).map(t => ({ id: t._id, name: t.name, subject: s.subject })));
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api("/academic/profile", {
        method: "PUT",
        body: {
          programme: form.programme,
          subjects: form.subjects,
          goal: form.goal,
          weeklyHours: Number(form.weeklyHours),
          strengths: form.strengths,
          weaknesses: form.weaknesses,
        },
      });
      setSuccess("Profile saved.");
      refresh();
      refreshSyllabuses();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Header
        title="Academic profile"
        subtitle="Set your subjects, goals and available study time."
      />
      <Notice error={error} success={success} />
      {loading ? (
        <ApexLoader message="Loading your academic profile" />
      ) : (
        <form className="panel max-w-3xl space-y-5" onSubmit={save}>
          <label className="block font-medium text-sm">
            Programme
            <input
              className="field mt-1"
              value={form.programme}
              onChange={(e) => update("programme", e.target.value)}
              required
            />
          </label>
          <fieldset>
            <legend className="font-medium text-sm mb-2">Select exactly four subjects ({form.subjects.length}/4)</legend>
            <div className="flex flex-wrap gap-4">
              {subjects.map((s) => (
                <label key={s} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={form.subjects.includes(s)}
                    disabled={!form.subjects.includes(s) && form.subjects.length >= 4}
                    onChange={(e) =>
                      update(
                        "subjects",
                        e.target.checked
                          ? [...form.subjects, s]
                          : form.subjects.filter((x) => x !== s),
                      )
                    }
                  />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block font-medium text-sm">
            Academic goal
            <textarea
              className="field mt-1"
              rows="3"
              maxLength="500"
              value={form.goal}
              onChange={(e) => update("goal", e.target.value)}
              placeholder="e.g. Complete core topics before the final examination"
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block font-medium text-sm">
              Study hours per week
              <input
                type="number"
                min="0"
                max="168"
                step="0.5"
                className="field mt-1"
                value={form.weeklyHours}
                onChange={(e) => update("weeklyHours", e.target.value)}
              />
            </label>
          </div>
          {["strengths", "weaknesses"].map(field => (
            <fieldset key={field}>
              <legend className="font-medium text-sm mb-2">{field === "strengths" ? "Strong topics" : "Weak topics"}</legend>
              <p className="muted text-sm mb-2">Select syllabus topics instead of typing them.</p>
              <div className="max-h-56 overflow-y-auto grid sm:grid-cols-2 gap-2">
                {availableTopics.filter(t => form.subjects.includes(t.subject)).map(t => (
                  <label key={t.id} className="flex gap-2 items-start text-sm">
                    <input type="checkbox" checked={form[field].includes(t.name)}
                      onChange={e => update(field, e.target.checked ? [...form[field], t.name] : form[field].filter(name => name !== t.name))} />
                    <span>{t.name}<span className="block muted text-xs">{t.subject}</span></span>
                  </label>
                ))}
              </div>
              {!availableTopics.length && <p className="muted text-sm">No syllabus topics available.</p>}
            </fieldset>
          ))}
          <button className="btn" disabled={busy || form.subjects.length !== 4}>
            {busy ? "Saving…" : "Save academic profile"}
          </button>
        </form>
      )}
    </>
  );
}
