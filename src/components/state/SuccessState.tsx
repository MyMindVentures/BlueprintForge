import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Confirms completed actions with the result and next step.
 * Used after saves, publishes, acknowledgements and other meaningful user actions.
 */
export function SuccessState({ title = 'Success', description, nextAction }: { title?: string; description: string; nextAction?: string }) {
  return <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6"><div className="mb-3 flex items-center gap-3 text-emerald-300"><CheckCircle2 size={18} /><h3 className="font-black uppercase tracking-widest">{title}</h3></div><p className="text-sm text-white/70">{description}</p>{nextAction && <p className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-200/70">Next: {nextAction}</p>}</div>;
}
