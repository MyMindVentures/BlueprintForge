import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipHelpProps {
  label: string;
  children: React.ReactNode;
}

/**
 * Shows small contextual help for controls whose disabled or next state may be unclear.
 * Used inline and keeps explanatory text visible on focus/hover for accessibility.
 */
export function TooltipHelp({ label, children }: TooltipHelpProps) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={label}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/40 hover:text-accent"
      >
        <HelpCircle size={13} />
      </button>
      {open && (
        <span role="tooltip" className="absolute right-0 top-8 z-50 w-64 rounded-2xl border border-white/10 bg-[#111] p-3 text-left text-xs leading-relaxed text-white/75 shadow-2xl">
          {children}
        </span>
      )}
    </span>
  );
}
