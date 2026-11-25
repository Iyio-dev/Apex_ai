import React from 'react';
import { BrainCircuit } from 'lucide-react';
export function BrainLoader({ label = 'Preparing your experience…', compact = false }) {
  return <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-4 ${compact ? 'py-7' : 'min-h-[230px] py-12'}`}>
    <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-inner">
      <span className="absolute inset-[-9px] rounded-[30px] border-2 border-transparent border-t-indigo-500 border-r-sky-400 animate-spin" />
      <span className="absolute inset-[-3px] rounded-[26px] border border-indigo-200 animate-pulse" />
      <BrainCircuit size={39} strokeWidth={1.7} className="animate-pulse" />
    </div>
    <div className="text-center"><p className="font-semibold text-slate-700">{label}</p><p className="text-xs text-slate-400 mt-1">APEX is working on it</p></div>
  </div>;
}
