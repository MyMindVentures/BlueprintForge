import React from "react";
import { motion } from "motion/react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabPanelProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Handles the tab panel workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function TabPanel({ tabs, activeTab, onChange, className = "" }: TabPanelProps) {
  return (
    <div className={`flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-2xl backdrop-blur-3xl shrink-0 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            relative group flex items-center gap-2.5 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300
            ${activeTab === tab.id ? 'text-white' : 'text-text-dim hover:text-white/80 hover:bg-white/5'}
          `}
        >
          {activeTab === tab.id && (
            <motion.div 
              layoutId="active-tab-bg"
              className="absolute inset-0 bg-white/10 rounded-xl ring-1 ring-white/10 shadow-lg"
            />
          )}
          <span className="relative z-10 flex items-center gap-2.5">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
