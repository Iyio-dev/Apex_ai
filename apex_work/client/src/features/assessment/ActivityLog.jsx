import React, { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, ChartNoAxesCombined, UserRound, BrainCircuit, LogOut, Menu, Plus, ArrowRight, CheckCircle2, Clock3, Target, Trash2, RefreshCw } from "lucide-react";
import { api, errorText } from "../../api";
import { useLoad } from "../../hooks/useLoad";
import { Header } from "../../components/ui/Header";
import { Metric } from "../../components/ui/Metric";
import { Notice } from "../../components/ui/Notice";
import { subjects, dateISO, prettyDate, cls } from "../../lib/format";
export function ActivityLog({ activity, onCancel, onSave }) {
  const [minutes, setMinutes] = useState(activity.actualMinutes || 0),
    [understanding, setUnderstanding] = useState(activity.understanding || 0),
    [feedback, setFeedback] = useState(activity.feedback || ""),
    [date, setDate] = useState(dateISO(activity.date));
  return (
    <form
      className="w-full grid sm:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          actualMinutes: Number(minutes),
          understanding: Number(understanding),
          feedback,
          date,
        });
      }}
    >
      <label className="text-sm">
        Minutes studied
        <input
          type="number"
          min="0"
          className="field mt-1"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
      </label>
      <label className="text-sm">
        Understanding (0–5)
        <select
          className="field mt-1"
          value={understanding}
          onChange={(e) => setUnderstanding(e.target.value)}
        >
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Reschedule date
        <input
          type="date"
          className="field mt-1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label className="text-sm">
        Feedback
        <input
          className="field mt-1"
          maxLength="1000"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What was difficult?"
        />
      </label>
      <div className="flex gap-2">
        <button className="btn">Save log</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
