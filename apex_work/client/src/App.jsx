import { ToastHost, toast } from "./components/ui/ToastHost";
import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, ChartNoAxesCombined, UserRound, BrainCircuit, LogOut, Menu, Plus, ArrowRight, CheckCircle2, Clock3, Target, Trash2, RefreshCw } from "lucide-react";
import { api, errorText } from "./api";
import { Auth, useAuth } from "./context/AuthContext";
import { Login } from "./features/auth/Login";
import { Landing } from "./features/Landing";
import { Shell } from "./layouts/Shell";
import { ApexLoader } from "./components/ui/ApexLoader";
export function App() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      if (error.status === 401) setUser(null);
      else toast("Sign-out failed. Please try again.", "error");
    }
  };
  if (loading) return <ApexLoader fullscreen message="Getting your academic space ready" />;
  return (
    <Auth.Provider value={{ user, setUser, logout }}>
      <ToastHost />
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Landing />} />
          <Route path="/" element={user ? <Shell /> : <Landing />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Login register />}
          />
          <Route
            path="/*"
            element={user ? <Shell /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </Auth.Provider>
  );
}
const links = [
  ["/", "Overview", LayoutDashboard],
  ["/profile", "Academic profile", UserRound],
  ["/syllabus", "Syllabus", BookOpen],
  ["/plans", "Study plans", CalendarDays],
  ["/assessment", "Daily assessment", ClipboardCheck],
  ["/progress", "Progress", ChartNoAxesCombined],
  ["/analysis", "AI analysis", BrainCircuit],
];
