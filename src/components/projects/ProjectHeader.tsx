import React from "react";
import { ChevronLeft, Save } from "lucide-react";

interface ProjectHeaderProps {
  projectName: string;
  onBack: () => void;
  onSave: () => void;
  tabs: { id: string; label: string; disabled: boolean }[];
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

/**
 * Handles the project header workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function ProjectHeader({ projectName, onBack, onSave, tabs, activeTab, setActiveTab }: ProjectHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:h-14 glass items-start md:items-center justify-between p-4 md:px-6 z-20 border-x-0 border-t-0 bg-black/20 backdrop-blur-3xl shrink-0 gap-4 md:gap-0">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-xl text-text-dim hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <h2 className="font-black text-[10px] text-white flex items-center gap-2 truncate max-w-[150px] sm:max-w-[200px] uppercase tracking-[0.2em]">
            <span className="text-white/20 font-bold hidden sm:inline">PROJECT /</span> {projectName}
          </h2>
        </div>
        
        <button 
          onClick={onSave}
          className="p-2 glass hover:bg-white/10 rounded-xl text-text-dim hover:text-white transition-all md:hidden"
          title="Manual Save Protocol"
        >
          <Save size={18} />
        </button>
      </div>
      
      {/* Tab Selectors */}
      <div className="w-full md:w-auto overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-0.5 bg-black/40 border border-white/5 p-1 rounded-xl w-max md:w-auto">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               disabled={tab.disabled}
               className={`
                 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap disabled:opacity-10
                 ${activeTab === tab.id 
                    ? 'bg-accent/20 text-accent ring-1 ring-accent/30 shadow-[0_0_15px_rgba(255,107,0,0.1)]' 
                    : 'text-text-dim hover:text-white hover:bg-white/5'}
               `}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <button 
          onClick={onSave}
          className="p-2 glass hover:bg-white/10 rounded-xl text-text-dim hover:text-white transition-all group"
          title="Manual Save Protocol"
        >
          <Save size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
}
