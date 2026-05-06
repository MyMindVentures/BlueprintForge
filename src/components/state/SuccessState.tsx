import { tx } from '../../i18n/I18nProvider';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Confirms completed actions with the result and next step.
 * Used after saves, publishes, acknowledgements and other meaningful user actions.
 */
export function SuccessState({ title, description, nextAction }: { title?: string; description: string; nextAction?: string }) {
  const resolvedTitle = title || tx('states.successTitle');
  return <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6"><div className="mb-3 flex items-center gap-3 text-emerald-300"><CheckCircle2 size={18} /><h3 className="font-black uppercase tracking-widest">{resolvedTitle}</h3></div><p className="text-sm text-white/70">{description}</p>{nextAction && <p className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-200/70">{tx("uiLegacy.components.state.successstate.001")}{nextAction}</p>}</div>;
}
