import { toast } from "./ToastHost";
import React, { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardCheck, ChartNoAxesCombined, UserRound, BrainCircuit, LogOut, Menu, Plus, ArrowRight, CheckCircle2, Clock3, Target, Trash2, RefreshCw } from "lucide-react";
import { api, errorText } from "../../api";
export function Notice({ error, success }) {
  React.useEffect(() => { if (error) toast(error, "error"); }, [error]);
  React.useEffect(() => { if (success) toast(success, "success"); }, [success]);
  return (
    <>
      {false && error && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-3 mb-4 text-sm"
        >
          {error}
        </div>
      )}
      {false && success && (
        <div
          role="status"
          className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 mb-4 text-sm"
        >
          {success}
        </div>
      )}
    </>
  );
}
