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
export function Syllabus() {
  const { data, error, loading, refresh } = useLoad("/academic/syllabuses"),
    { data: progress, refresh: refreshProgress } =
      useLoad("/academic/progress"),
    [selected, setSelected] = useState("All"),
    [saving, setSaving] = useState(""),
    [message, setMessage] = useState("");
  const records = Array.isArray(data) ? data : [];
  const map = new Map(
    (Array.isArray(progress) ? progress : []).map((x) => [String(x.topic), x]),
  );
  const update = async (id, patch) => {
    setSaving(id);
    setMessage("");
    try {
      await api("/academic/progress/" + id, { method: "PUT", body: patch });
      refreshProgress();
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      setSaving("");
    }
  };
  return (
    <>
      <Header
        title="Your syllabus"
        subtitle="Lecture coverage and understanding are tracked independently."
        action={
          <select
            className="field w-auto"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option>All</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        }
      />
      <Notice error={error || message} />
      {loading ? (
        <ApexLoader message="Loading your syllabus" />
      ) : records.filter((s) => selected === "All" || s.subject === selected)
          .length === 0 ? (
        <div className="panel">
          No syllabus content yet. An administrator must seed the verified OAU
          JUPEB syllabus.
        </div>
      ) : (
        records
          .filter((s) => selected === "All" || s.subject === selected)
          .map((s) => (
            <section className="mb-6" key={s._id}>
              <h3 className="font-bold text-xl mb-3">{s.subject}</h3>
              <div className="space-y-5">
                {["001", "002", "003", "004", "Uncategorized"].map(course => {
                  const group = (s.topics || []).filter(t => {
                    const code = String(t.courseCode || t.course || "").toUpperCase();
                    const match = code.match(/(?:^|\D)00([1-4])(?:\D|$)/);
                    return course === "Uncategorized" ? !match : match?.[1] === course.slice(-1);
                  });
                  if (!group.length) return null;
                  return <div key={course} className="space-y-3">
                    <h4 className="font-bold text-lg">{course === "Uncategorized" ? "Topics awaiting course classification" : `${s.subject} ${course}`}</h4>
                    {group.map((t) => {
                  const x = map.get(String(t._id));
                  return (
                    <div
                      key={t._id}
                      className="panel flex flex-wrap justify-between gap-4"
                    >
                      <div className="flex-1 min-w-48">
                        <h4 className="font-semibold">{t.name}</h4>
                        <p className="muted">
                          {t.description ||
                            `${t.difficulty || "medium"} difficulty · ${t.estimatedHours ?? 1} estimated hours`}
                        </p>
                        {t.objectives?.length > 0 && <p className="muted mt-2">Objectives: {t.objectives.join(" · ")}</p>}
                        {t.predictedNext && <span className="syllabus-predicted">Upcoming · study ahead</span>}
                        {t.subtopics?.length > 0 && (
                          <p className="muted mt-2">
                            {t.subtopics.map((x) => x.name).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 items-center">
                        <span className="text-xs font-semibold text-sky-700 dark:text-sky-200">{t.lectureCovered ? "Covered by lecturer" : t.predictedNext ? "Predicted next · study ahead" : "Upcoming syllabus topic"}</span>
                        <label className="text-sm">
                          Understanding{" "}
                          <select
                            className="field ml-2 w-auto"
                            disabled={saving === t._id}
                            value={x?.understanding ?? 0}
                            onChange={(e) =>
                              update(t._id, {
                                understanding: Number(e.target.value),
                              })
                            }
                          >
                            {[0, 1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}/5
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  );
                    })}
                  </div>;
                })}
              </div>
            </section>
          ))
      )}
    </>
  );
}
