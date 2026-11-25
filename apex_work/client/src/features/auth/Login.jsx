import { Eye, EyeOff, Sun, Moon, Monitor, GraduationCap, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Notice } from "../../components/ui/Notice";
import React, { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, ChartNoAxesCombined, UserRound, BrainCircuit, LogOut, Menu, Plus, ArrowRight, CheckCircle2, Clock3, Target, Trash2, RefreshCw } from "lucide-react";
import { api, errorText } from "../../api";
import { useAuth } from "../../context/AuthContext";
export function Login({ register = false }) {
  const {theme,setTheme} = useTheme();
  const [showPassword,setShowPassword] = useState(false);
  const [confirmPassword,setConfirmPassword] = useState("");
  const nav = useNavigate(),
    { setUser } = useAuth(),
    [form, setForm] = useState({ name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (register && form.password !== confirmPassword) { setError("Passwords do not match."); return; }
    setBusy(true);
    setError("");
    try {
      const r = await api("/auth/" + (register ? "register" : "login"), {
        method: "POST",
        body: register ? form : { email: form.email, password: form.password },
      });
      setUser(r.user);
      nav("/");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page min-h-screen flex items-center justify-center p-5 md:p-10">
      <div className="auth-wrap w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-3xl">
      <section className="auth-intro hidden md:flex flex-col justify-between p-12">
        <div className="flex items-center gap-3 text-2xl font-black"><GraduationCap/> APEX<span className="text-sky-300">.</span></div>
        <div><Sparkles className="mb-6" size={36}/><h2 className="text-4xl font-bold leading-tight">A clearer path to academic excellence.</h2><p className="mt-5 text-sky-100/90 leading-relaxed">Your academic profile, assessments, study plans and personalized AI guidance, together in one intelligent workspace.</p></div>
        <p className="text-sm text-sky-100/70">Plan smarter. Learn confidently. Grow every day.</p>
      </section>
      <div className="auth-card p-7 sm:p-10 md:p-12">
        <div className="flex justify-end gap-1 mb-5" role="group" aria-label="Appearance">{[["light",Sun],["dark",Moon],["system",Monitor]].map(([value,Icon])=><button type="button" title={value} aria-label={`${value} theme`} aria-pressed={theme===value} onClick={()=>setTheme(value)} className={`theme-icon ${theme===value?"active":""}`} key={value}><Icon size={17}/></button>)}</div>
        <div className="text-3xl font-black text-slate-900 mb-2">
          APEX<span className="text-indigo-600">.</span>
        </div>
        <h1 className="heading">
          {register ? "Create your account" : "Welcome back"}
        </h1>
        <p className="muted mt-2 mb-7">
          Personalized preparation for your JUPEB examinations.
        </p>
        <Notice error={error} />
        <form onSubmit={submit} className="space-y-4">
          {register && (
            <label className="block text-sm font-medium">
              Full name
              <input
                className="field mt-1"
                required
                maxLength="80"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              className="field mt-1"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type={showPassword ? "text" : "password"}
              className="field mt-1"
              required
              minLength={8}
              autoComplete={register ? "new-password" : "current-password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button type="button" className="text-sm text-sky-600 dark:text-sky-300 font-medium" onClick={()=>setShowPassword(!showPassword)}>{showPassword ? <><EyeOff size={15} className="inline mr-1"/>Hide password</> : <><Eye size={15} className="inline mr-1"/>Show password</>}</button>
          {register && <label className="block text-sm font-medium">Confirm password<input className="field mt-1" type={showPassword?"text":"password"} required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label>}
          <button className="btn w-full" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}{" "}
            <ArrowRight size={17} className="ml-2" />
          </button>
        </form>
        <p className="text-sm text-center mt-6">
          {register ? "Already registered?" : "New to APEX?"}{" "}
          <NavLink
            className="text-indigo-600 font-semibold"
            to={register ? "/login" : "/register"}
          >
            {register ? "Sign in" : "Create account"}
          </NavLink>
        </p>
      </div>
      </div>
    </div>
  );
}
