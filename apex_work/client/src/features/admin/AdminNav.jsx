import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, ClipboardList, Plus, Save, Trash2, RefreshCw, ShieldCheck, ChevronRight, Pencil, X, Search, Layers3, CircleHelp, CheckCircle2 } from "lucide-react";
import { api, errorText } from "../../api";
import { cx } from "./adminUI";
export function AdminNav() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    api("/academic/admin/access").then(() => active && setAllowed(true)).catch(() => {});
    return () => { active = false; };
  }, []);
  if (!allowed) return null;
  return <NavLink to="/admin" className={({isActive}) =>
    cx("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
      isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800")
  }><ShieldCheck size={18}/> Content admin</NavLink>;
}

