import React, { useState } from "react";
import { motion } from "motion/react";
import { Brain, Settings2, Bot, Cpu, Sparkles, Loader2 } from "lucide-react";
import { AIAgent, LLMSettings, Project } from "../../types";
import { HelpIcon } from "../Onboarding";

interface RawConceptPanelProps {
  project: Project;
  agents: AIAgent[];
  llmSettings: LLMSettings;
  onUpdate: (updates: Partial<Project>) => void;
  onGenerate: () => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  isPipelineRunning: boolean;
  activeTab: string;
}

export function RawConceptPanel({
  project, agents, llmSettings, onUpdate, onGenerate, inputValue, setInputValue, isPipelineRunning, activeTab
}: RawConceptPanelProps) {
  const [isAdvanced, setIsAdvanced] = useState(false);

  return (
    <section 
      className={`lg:w-[400px] xl:w-[450px] border-r border-white/10 flex flex-col bg-black/20 shrink-0 ${activeTab !== 'input' ? 'hidden lg:flex' : 'flex'}`}
    >
      <div className="h-12 flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-text-dim">
          <Brain size={14} className="text-accent" />
          Vision Parameters
          <HelpIcon title="Concept Input" content="Detail the features, user roles, and core value prop of your application." />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-auto scrollbar-thin">
          <button 
            onClick={() => setIsAdvanced(!isAdvanced)}
            className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-accent transition-colors"
          >
            <Settings2 size={12} className={isAdvanced ? 'rotate-90 text-accent transition-transform' : 'transition-transform'} />
            {isAdvanced ? "Consolidate Parameters" : "Advanced Architecture"}
          </button>

         {isAdvanced && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             className="space-y-4 overflow-hidden border-l border-white/5 pl-4 ml-1.5"
           >
             <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Master Agent</label>
                <select 
                  value={project.selectedAgentId || ""}
                  onChange={(e) => onUpdate({ selectedAgentId: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-accent/40"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id} className="bg-bg text-white">{a.code}: {a.name}</option>
                  ))}
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Intelligence Model</label>
                <select 
                  value={project.modelOverrideId || ""}
                  onChange={(e) => onUpdate({ modelOverrideId: e.target.value || null })}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-accent/40"
                >
                  <option value="" className="text-accent italic">Auto Logic</option>
                  {llmSettings.models.filter(m => m.enabled).map(m => (
                    <option key={m.id} value={m.id} className="bg-bg text-white">{m.name}</option>
                  ))}
                </select>
             </div>

             <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 mt-4">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Auto Visuals</div>
                  <div className="text-[8px] font-bold text-white/30 uppercase tracking-tight">Run Image Pipeline after specs</div>
                </div>
                <button 
                  onClick={() => onUpdate({ autoGenerateImages: !project.autoGenerateImages })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${project.autoGenerateImages ? 'bg-accent' : 'bg-white/10'}`}
                >
                  <motion.div 
                    initial={false}
                    animate={{ x: project.autoGenerateImages ? 22 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full"
                  />
                </button>
              </div>
           </motion.div>
         )}

         <div className="flex-1 flex flex-col min-h-[300px] space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Raw Concept Blueprint</label>
              {inputValue && (
                <button onClick={() => setInputValue("")} className="text-[9px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest">Wipe</button>
              )}
            </div>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="E.g. Full-stack marketplace for antique clocks with auction features and secure checkout..."
              className="flex-1 w-full p-6 text-sm bg-black/40 border border-white/5 rounded-[32px] focus:outline-none focus:border-accent/40 shadow-inner resize-none leading-relaxed transition-all scrollbar-none"
            />
         </div>

         <div className="pt-2">
            <button
              disabled={!inputValue.trim() || isPipelineRunning}
              onClick={onGenerate}
              className="relative group w-full h-16 rounded-[24px] bg-accent p-[2px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:grayscale"
            >
              <div className="w-full h-full bg-[#050505] rounded-[22px] flex items-center justify-center gap-3 overflow-hidden">
                <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {isPipelineRunning ? (
                  <>
                    <Loader2 size={24} className="animate-spin text-accent" />
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Sequence Engaged</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="text-accent group-hover:rotate-12 transition-transform" />
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Execute Pipeline</span>
                  </>
                )}
              </div>
            </button>
         </div>
      </div>
    </section>
  );
}
