import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BrainCircuit, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, GraduationCap, Moon, Play, Sun, Monitor, Sparkles, UserRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const steps = [
  {title:'Build your academic profile', subtitle:'Tell APEX about your courses and goals.', detail:'Keep your academic information in one place so your study experience starts with your own priorities.', Icon:UserRound, label:'01 / Profile'},
  {title:'Review your assessments', subtitle:'Understand what needs attention.', detail:'Use assessments and progress tracking to identify topics that deserve more practice.', Icon:ClipboardCheck, label:'02 / Assess'},
  {title:'Plan your next study session', subtitle:'Turn priorities into a practical plan.', detail:'Organize study activities around your courses and available time.', Icon:CalendarDays, label:'03 / Plan'},
  {title:'Get actionable AI guidance', subtitle:'Start, Stop, Reduce and Reinforce.', detail:'Explore personalized recommendations based on the academic information you provide.', Icon:BrainCircuit, label:'04 / Improve'},
];
export function Landing() {
  const [active,setActive] = useState(0);
  const {theme,setTheme} = useTheme();
  const current = steps[active];
  const Icon = current.Icon;
  return <div className="landing-page min-h-screen">
    <header className="landing-nav mx-auto max-w-6xl px-5 sm:px-8 py-5 flex items-center justify-between gap-3">
      <Link to="/welcome" className="flex items-center gap-2 font-black text-2xl tracking-tight landing-title" aria-label="APEX home"><GraduationCap size={28} className="text-sky-500"/> APEX<span className="text-sky-500">.</span></Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="landing-theme" role="group" aria-label="Appearance">{[['light',Sun],['dark',Moon],['system',Monitor]].map(([value,ThemeIcon])=><button key={value} type="button" title={`${value} mode`} aria-label={`${value} mode`} aria-pressed={theme===value} className={theme===value?'selected':''} onClick={()=>setTheme(value)}><ThemeIcon size={16}/></button>)}</div>
        <Link to="/login" className="landing-login text-sm font-semibold px-2 sm:px-4 py-2">Log in</Link>
        <Link to="/register" className="landing-primary text-sm font-semibold px-4 py-2.5 rounded-xl">Get started <ArrowRight className="inline ml-1" size={15}/></Link>
      </div>
    </header>
    <main>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-14 sm:pt-24 sm:pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="landing-eyebrow inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-wide"><Sparkles size={15}/> YOUR ACADEMIC COMPANION</div>
          <h1 className="landing-title text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mt-6">A clearer way to <span className="landing-accent">reach your academic goals.</span></h1>
          <p className="landing-subtitle mt-6 text-lg leading-relaxed max-w-xl">Bring your courses, assessments, study plans and AI-powered guidance together in one calm, focused workspace.</p>
          <div className="flex flex-wrap gap-3 mt-8"><Link to="/register" className="landing-primary px-6 py-3.5 rounded-xl font-semibold">Create free account <ArrowRight size={18} className="inline ml-2"/></Link><a href="#walkthrough" className="landing-outline px-6 py-3.5 rounded-xl font-semibold"><Play size={16} className="inline mr-2"/> See walkthrough</a></div>
          <p className="landing-subtitle text-sm mt-5">Explore the walkthrough below — no account needed.</p>
        </div>
        <div className="landing-preview rounded-3xl p-5 sm:p-7" aria-label="Illustrative APEX workspace preview">
          <div className="flex items-center justify-between mb-7"><div className="flex gap-2 items-center font-bold landing-title"><GraduationCap className="text-sky-500"/> Academic overview</div><span className="landing-pill text-xs px-3 py-1.5 rounded-full">Preview</span></div>
          <div className="landing-preview-card p-5 rounded-2xl mb-4"><div className="landing-subtitle text-xs font-semibold uppercase tracking-wider">Your learning journey</div><div className="landing-title text-2xl font-bold mt-2">Make every study session count.</div><p className="landing-subtitle text-sm mt-2">See what matters, make a plan, and track your progress.</p></div>
          <div className="grid grid-cols-2 gap-3">{[[BookOpen,'Courses','Stay organized'],[ClipboardCheck,'Assessments','Find focus areas'],[CalendarDays,'Study plans','Plan ahead'],[BrainCircuit,'AI guidance','Take action']].map(([Item,title,description])=><div key={title} className="landing-preview-card rounded-2xl p-4"><Item size={22} className="text-sky-500 mb-3"/><div className="landing-title font-bold text-sm">{title}</div><div className="landing-subtitle text-xs mt-1">{description}</div></div>)}</div>
          <p className="landing-subtitle text-xs mt-4 text-center">Illustrative preview · Not live student data</p>
        </div>
      </section>
      <section id="walkthrough" className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 scroll-mt-8">
        <div className="text-center max-w-2xl mx-auto"><div className="landing-accent font-bold text-sm uppercase tracking-widest">A quick walkthrough</div><h2 className="landing-title text-3xl sm:text-4xl font-extrabold mt-3">See how APEX works</h2><p className="landing-subtitle mt-4">Four simple steps from academic setup to meaningful next actions.</p></div>
        <div className="landing-walkthrough mt-10 rounded-3xl p-5 sm:p-8 grid md:grid-cols-[.9fr_1.1fr] gap-8 items-center">
          <div className="flex flex-col gap-2" role="tablist" aria-label="Walkthrough steps">{steps.map((step,i)=><button key={step.title} type="button" role="tab" aria-selected={active===i} onClick={()=>setActive(i)} className={`landing-step text-left rounded-2xl px-4 py-4 flex items-center gap-4 ${active===i?'active':''}`}><span className="landing-step-number text-sm font-bold">{String(i+1).padStart(2,'0')}</span><span><span className="block font-semibold">{step.title}</span><span className="landing-subtitle text-xs block mt-1">{step.subtitle}</span></span></button>)}</div>
          <div className="landing-demo-card rounded-3xl p-6 sm:p-9 min-h-[315px] flex flex-col justify-between" role="tabpanel"><div><span className="landing-pill inline-flex text-xs font-bold rounded-full px-3 py-1.5">{current.label}</span><div className="landing-demo-icon mt-7 w-16 h-16 rounded-2xl grid place-items-center"><Icon size={31}/></div><h3 className="landing-title text-2xl font-extrabold mt-5">{current.title}</h3><p className="landing-subtitle mt-3 leading-relaxed">{current.detail}</p></div><div className="flex justify-between items-center mt-8"><span className="landing-subtitle text-sm">{active+1} of {steps.length}</span><div className="flex gap-2"><button type="button" className="landing-arrow" aria-label="Previous step" onClick={()=>setActive((active+steps.length-1)%steps.length)}><ChevronLeft size={20}/></button><button type="button" className="landing-arrow" aria-label="Next step" onClick={()=>setActive((active+1)%steps.length)}><ChevronRight size={20}/></button></div></div></div>
        </div>
        <p className="landing-subtitle text-center text-xs mt-4">Interactive product walkthrough; no account or real academic data required.</p>
      </section>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20"><div className="landing-cta text-center rounded-3xl px-6 py-12 sm:py-16"><CheckCircle2 size={30} className="text-sky-500 mx-auto"/><h2 className="landing-title text-3xl sm:text-4xl font-extrabold mt-4">Ready to make progress?</h2><p className="landing-subtitle mt-3 mb-7">Start with your academic profile. Build from there.</p><Link to="/register" className="landing-primary inline-block px-7 py-3.5 rounded-xl font-semibold">Get started <ArrowRight size={17} className="inline ml-2"/></Link></div></section>
    </main>
    <footer className="landing-footer text-center py-7 px-5 text-sm">© {new Date().getFullYear()} APEX · Plan smarter. Learn confidently.</footer>
  </div>;
}
