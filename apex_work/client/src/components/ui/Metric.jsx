import React, { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, ChartNoAxesCombined, UserRound, BrainCircuit, LogOut, Menu, Plus, ArrowRight, CheckCircle2, Clock3, Target, Trash2, RefreshCw } from "lucide-react";
import { api, errorText } from "../../api";
export function Metric({ label, value, Icon, detail }) {
  return (
    <div className="panel metric-card">
      <div className="flex justify-between items-center gap-3">
        <span className="muted metric-label">{label}</span>
        {Icon && <span className="metric-icon"><Icon size={18} /></span>}
      </div>
      <div className="metric-value">{value}</div>
      {detail && <p className="muted metric-detail">{detail}</p>}
    </div>
  );
}
