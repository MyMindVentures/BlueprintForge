import React from 'react';
import { Info, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HelpBlockProps {
  title: string;
  purpose: string;
  state?: string;
  nextAction?: string;
  disabledReason?: string;
  className?: string;
}

/**
 * Renders concise in-screen guidance so users understand purpose, state and next action.
 * Used across public, builder and founder screens without changing access rules or persistence.
 */
export function HelpBlock({ title, purpose, state, nextAction, disabledReason, className = '' }: HelpBlockProps) {
  return (
    <aside className={`rounded-3xl border border-accent/15 bg-accent/[0.04] p-5 text-sm text-white/75 space-y-4 ${className}`} aria-label={`${title} guidance`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-accent/10 p-2 text-accent"><Info size={16} /></div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">What this screen does</p>
          <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-white">{title}</h2>
          <p className="mt-1 leading-relaxed text-text-dim">{purpose}</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {state && <HelpPill icon={<CheckCircle2 size={14} />} label="Current state" text={state} />}
        {nextAction && <HelpPill icon={<ArrowRight size={14} />} label="Next action" text={nextAction} />}
        {disabledReason && <HelpPill icon={<AlertCircle size={14} />} label="Why disabled" text={disabledReason} />}
      </div>
    </aside>
  );
}

/**
 * Formats one user-facing guidance fact inside HelpBlock.
 * Used for state, next-action and disabled-reason microcopy.
 */
function HelpPill({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
      <div className="mb-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/45">{icon}{label}</div>
      <p className="text-xs leading-relaxed text-white/70">{text}</p>
    </div>
  );
}
