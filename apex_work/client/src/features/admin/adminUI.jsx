import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, ClipboardList, Plus, Save, Trash2, RefreshCw, ShieldCheck, ChevronRight, Pencil, X, Search, Layers3, CircleHelp, CheckCircle2 } from "lucide-react";
import { api, errorText } from "../../api";
export const SUBJECTS = ["Mathematics", "Chemistry", "Physics", "Biology", "Agricultural Science", "Geography", "Business Studies", "Economics", "Accounting", "Government", "Christian Religious Studies", "French", "History", "Islamic Studies", "Literature-in-English", "Music", "Visual Arts", "Igbo", "Yoruba"];
export const emptySyllabus = () => ({
  programme: "OAU JUPEB", subject: "Mathematics", description: "", topics: []
});
export const emptyQuestion = () => ({
  subject: "Mathematics", topic: "", text: "", options: ["", "", "", ""],
  correctAnswer: "", explanation: "", difficulty: "medium"
});
export const cx = (...items) => items.filter(Boolean).join(" ");

export function Field({ label, children, hint }) {
  return <label className="block text-sm font-medium text-slate-700">
    <span>{label}</span>{children}
    {hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}
  </label>;
}
export function Input(props) { return <input {...props} className={cx("field mt-1", props.className)} />; }
export function Textarea(props) { return <textarea {...props} className={cx("field mt-1 min-h-24", props.className)} />; }
export function Select(props) { return <select {...props} className={cx("field mt-1", props.className)} />; }
export function Button({ children, secondary, danger, ...props }) {
  return <button {...props} className={cx(
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
    danger ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" :
    secondary ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" :
    "bg-indigo-600 text-white hover:bg-indigo-700", props.className
  )}>{children}</button>;
}
export function Alert({ error, success }) {
  if (!error && !success) return null;
  return <div role={error ? "alert" : "status"} className={cx(
    "mb-4 rounded-xl border p-3 text-sm",
    error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
  )}>{error || success}</div>;
}
export function Stat({ icon: Icon, label, value, note }) {
  return <div className="panel metric-card">
    <div className="flex items-center justify-between gap-3 text-slate-500"><span className="metric-label">{label}</span><span className="metric-icon"><Icon size={18}/></span></div>
    <div className="metric-value">{value}</div>
    <p className="metric-detail">{note}</p>
  </div>;
}

