import React from 'react';

/**
 * Displays an honest loading explanation for screens waiting on auth, Firestore or integrations.
 * Used when users need to know what the app is doing and what will happen next.
 */
export function LoadingState({ title = 'Loading state', description = 'The app is loading the latest data. Actions unlock when the required state is ready.' }: { title?: string; description?: string }) {
  return <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent/20 border-t-accent" /><h3 className="font-black uppercase tracking-widest text-white">{title}</h3><p className="mt-2 text-sm text-text-dim">{description}</p></div>;
}
