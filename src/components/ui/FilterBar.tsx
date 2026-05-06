import React from "react";

interface FilterBarProps {
  options: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Handles the filter bar workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function FilterBar({ options, activeId, onChange, className = "" }: FilterBarProps) {
  return (
    <div className={`flex items-center gap-2 p-1.5 glass bg-white/[0.02] border border-white/5 rounded-2xl ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`
            px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
            ${activeId === option.id ? 'bg-accent text-white shadow-lg' : 'text-text-dim hover:text-white hover:bg-white/5'}
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
