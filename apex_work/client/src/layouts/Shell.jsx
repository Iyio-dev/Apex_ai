import { Sun, Moon, Monitor, Sparkles, ShieldCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import React, { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, ChartNoAxesCombined, UserRound, BrainCircuit, LogOut, Menu, Zap, Plus, ArrowRight, CheckCircle2, Clock3, Target, Trash2, RefreshCw } from "lucide-react";
import { api, errorText } from "../api";
import { useAuth } from "../context/AuthContext";
import { cls } from "../lib/format";
import { AdminNav } from "../features/admin/AdminNav";
import { Dashboard } from "../features/dashboard/Dashboard";
import { Profile } from "../features/profile/Profile";
import { Syllabus } from "../features/syllabus/Syllabus";
import { Plans } from "../features/plans/Plans";
import { Assessment } from "../features/assessment/Assessment";
import { Progress } from "../features/progress/Progress";
import { Analysis } from "../features/analysis/Analysis";
import Admin from "../features/admin/Admin";
const links = [
  ["/", "Overview", LayoutDashboard],
  ["/profile", "Academic profile", UserRound],
  ["/syllabus", "Syllabus", BookOpen],
  ["/plans", "Study plans", CalendarDays],
  ["/assessment", "Daily assessment", ClipboardCheck],
  ["/progress", "Progress", ChartNoAxesCombined],
  ["/analysis", "AI analysis", BrainCircuit],
];
export function Shell() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth(),
    [open, setOpen] = useState(false);
  return (
    <div className="apex-app min-h-screen md:flex">
      <aside
        className={cls(
          "apex-sidebar md:w-64 md:min-h-screen md:sticky md:top-0 md:h-screen shrink-0",
          open ? "" : "",
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="text-2xl font-black text-white tracking-tight">
            APEX<span className="text-indigo-400">.</span>
          </div>
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            <Menu />
          </button>
        </div>
        <nav
          className={cls("px-3 space-y-1", open ? "block" : "hidden md:block")}
        >
          {links.map(([to, name, Icon]) => (
            <NavLink
              key={to}
              end={to === "/"}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cls(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive ? "bg-sky-500/25 text-sky-900 dark:text-sky-100 ring-1 ring-sky-300/30" : "hover:bg-sky-400/10",
                )
              }
            >
              <Icon size={18} />
              {name}
            </NavLink>
          ))}
          <AdminNav />
        </nav>
        <div className="px-6 pt-8 pb-6 md:absolute md:bottom-0 md:w-64">
          <div className="theme-switch mb-5" role="group" aria-label="Appearance">
            {[["light",Sun],["dark",Moon],["system",Monitor]].map(([value,Icon]) => <button key={value} title={value} aria-label={`${value} theme`} aria-pressed={theme===value} onClick={()=>setTheme(value)} className={theme===value?"selected":""}><Icon size={17}/></button>)}
          </div>
          <p className="text-sm text-white truncate">{user.name}</p>
          <p className="text-xs truncate">{user.email}</p>
          <button
            onClick={logout}
            className="mt-4 flex gap-2 items-center text-sm hover:text-white"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="apex-header px-5 md:px-10 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-600 dark:text-sky-300 font-bold flex items-center gap-2"><Sparkles size={14}/> APEX Academic Intelligence</p>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">Focus smarter. Progress further.</h1>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-100 grid place-items-center font-bold shadow-sm ring-2 ring-white/70">
            {user.name?.[0]?.toUpperCase()}
          </div>
        </header>
        <div className="p-5 md:p-10 max-w-7xl mx-auto">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="syllabus" element={<Syllabus />} />
            <Route path="plans" element={<Plans />} />
            <Route path="assessment" element={<Assessment />} />
            <Route path="progress" element={<Progress />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
