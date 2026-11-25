import React, { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, ChartNoAxesCombined, UserRound, BrainCircuit, LogOut, Menu, Plus, ArrowRight, CheckCircle2, Clock3, Target, Trash2, RefreshCw } from "lucide-react";
import { api, errorText } from "../../api";
export function Header({ title, subtitle, action }) {
  return (
    <div className="page-heading flex flex-wrap justify-between gap-4 items-start mb-7">
      <div>
        <h2 className="heading">{title}</h2>
        <p className="muted mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
