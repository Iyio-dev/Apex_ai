import React from "react";
import { BrainCircuit, Sparkles, LoaderCircle } from "lucide-react";

/** Accessible animated loading dialog. Use `fullscreen` while restoring a session. */
export function ApexLoader({ message = "Preparing your workspace", fullscreen = false }) {
  return (
    <div className={`apex-loader-backdrop ${fullscreen ? "apex-loader-fullscreen" : "apex-loader-contained"}`} role="status" aria-live="polite" aria-label={message}>
      <div className="apex-loader-dialog">
        <div className="apex-loader-orbit" aria-hidden="true">
          <span className="apex-loader-halo" />
          <BrainCircuit size={36} strokeWidth={1.8} className="apex-loader-brain" />
          <Sparkles size={17} className="apex-loader-spark" />
        </div>
        <strong className="apex-loader-title">APEX <span>AI</span></strong>
        <p className="apex-loader-message">{message}</p>
        <div className="apex-loader-progress" aria-hidden="true"><span /></div>
        <div className="apex-loader-foot"><LoaderCircle size={14} className="apex-loader-spin" /> Just a moment</div>
      </div>
    </div>
  );
}
