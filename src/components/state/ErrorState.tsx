import { tx } from '../../i18n/I18nProvider';
import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Presents errors with recovery guidance instead of leaving users at a dead end.
 * Used by screens and workflows when a backend, auth or integration operation fails.
 */
export function ErrorState({ title, description, nextAction }: { title?: string; description: string; nextAction?: string }) {
  const resolvedTitle = title || tx('states.errorTitle');
  const resolvedNextAction = nextAction || tx('states.errorNextAction');
  return <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6"><div className="mb-3 flex items-center gap-3 text-red-300"><AlertTriangle size={18} /><h3 className="font-black uppercase tracking-widest">{resolvedTitle}</h3></div><p className="text-sm text-white/70">{description}</p><p className="mt-2 text-xs font-bold uppercase tracking-widest text-red-200/70">{tx("uiLegacy.components.state.errorstate.001")}{resolvedNextAction}</p></div>;
}
