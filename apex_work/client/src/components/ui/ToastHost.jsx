import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
export function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const receive = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      setItems(current => [...current.slice(-3), { ...event.detail, id }]);
    };
    window.addEventListener('apex:toast', receive);
    return () => window.removeEventListener('apex:toast', receive);
  }, []);
  useEffect(() => {
    if (!items.length) return;
    const timers = items.map(item => setTimeout(() => setItems(current => current.filter(x => x.id !== item.id)), 6500));
    return () => timers.forEach(clearTimeout);
  }, [items]);
  return <div className="fixed bottom-5 right-4 left-4 sm:left-auto sm:w-[390px] z-[100] space-y-3 pointer-events-none" aria-live="polite">
    {items.map(item => <div key={item.id} role={item.type === 'error' ? 'alert' : 'status'} className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/15">
      {item.type === 'error' ? <AlertCircle className="shrink-0 text-rose-600"/> : <CheckCircle2 className="shrink-0 text-emerald-600"/>}
      <div className="min-w-0 flex-1"><p className="font-semibold text-slate-900 text-sm">{item.type === 'error' ? 'Something went wrong' : 'Success'}</p><p className="text-sm text-slate-600 mt-1 break-words">{item.message}</p>
        {item.retry && <button type="button" onClick={() => { setItems(current => current.filter(x => x.id !== item.id)); item.retry(); }} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"><RefreshCw size={14}/> Retry</button>}
      </div><button type="button" aria-label="Dismiss notification" onClick={() => setItems(current => current.filter(x => x.id !== item.id))} className="text-slate-400 hover:text-slate-700"><X size={17}/></button>
    </div>)}
  </div>;
}
export function toast(message, type = 'success', retry) { window.dispatchEvent(new CustomEvent('apex:toast', { detail: { message, type, retry } })); }
