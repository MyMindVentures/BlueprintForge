import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, Check, Bot, Settings2, MessageSquare, Maximize, Brain, Star, Trash2, ShieldCheck, FileCode, AlertCircle, Wand2, Thermometer, Globe, Sparkles, Cpu
} from "lucide-react";
import { AIAgent, LLMSettings } from "../../types";
import { useToast } from "../ui/Toast";
import { GlassPanel } from "../ui/GlassPanel";
import { StatusBadge } from "../ui/StatusBadge";

interface AgentEditorProps {
  agent: AIAgent;
  llmSettings: LLMSettings;
  onUpdate: (updates: Partial<AIAgent>) => void;
  onBack: () => void;
  onDelete: (id: string) => void;
}

/**
 * Handles the agent editor workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function AgentEditor({ agent, llmSettings, onUpdate, onBack, onDelete }: AgentEditorProps) {
  const toast = useToast();
  const [activePanel, setActivePanel] = useState<"general" | "logic" | "parameters">("general");
  const enabledModels = llmSettings.models.filter(m => m.enabled);

  const sidebarButtons = [
    { id: "general", label: "Identity", icon: Bot },
    { id: "logic", label: "Logic", icon: MessageSquare },
    { id: "parameters", label: "Parameters", icon: Maximize },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden">
      {/* Editor Header */}
      <header className="min-h-[64px] border-b border-white/5 py-4 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between bg-black/40 backdrop-blur-3xl shrink-0 z-20 gap-4 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-dim hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/20 rounded-2xl flex items-center justify-center text-accent ring-1 ring-accent/30 shrink-0">
                <Bot size={22} className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-widest leading-none mb-1 truncate">{agent.name}</h1>
                <div className="flex flex-wrap items-center gap-2 hidden sm:flex">
                   <span className="text-[9px] font-black text-accent uppercase tracking-tighter">Protocol Configuration</span>
                   <StatusBadge status={agent.status} dot={false} />
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => { if(confirm(`Delete "${agent.name}"?`)) { onDelete(agent.id); toast.success("Agent deleted."); }}}
            className="p-2 sm:p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all md:hidden"
            title="Terminate Protocol"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={() => { if(confirm(`Delete "${agent.name}"?`)) { onDelete(agent.id); toast.success("Agent deleted."); }}}
            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all hidden md:block"
            title="Terminate Protocol"
          >
            <Trash2 size={18} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1 hidden md:block" />
          <button
            onClick={() => { toast.success("Changes deployed."); onBack(); }}
            className="glass-btn-primary flex-1 md:flex-none !h-10 !px-6 !text-[11px] !font-black !uppercase !tracking-widest"
          >
            Deploy Changes
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.01] p-4 md:p-8 space-y-4 md:space-y-6 overflow-x-auto md:overflow-y-auto shrink-0 flex flex-row md:flex-col items-start scrollbar-none md:scrollbar-thin">
          <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 min-w-max md:min-w-0 w-full md:w-auto">
            {sidebarButtons.map((btn) => (
              <button 
                key={btn.id}
                onClick={() => setActivePanel(btn.id as any)}
                className={`
                  flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-4 px-4 py-3 md:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${activePanel === btn.id 
                    ? 'bg-accent/15 text-accent border border-accent/30 shadow-[0_0_20px_rgba(255,107,0,0.1)]' 
                    : 'text-text-dim hover:bg-white/5 hover:text-white border border-transparent'}
                `}
              >
                <btn.icon size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="whitespace-nowrap">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:block pt-6 border-t border-white/5 space-y-6 w-full">
             <div className="space-y-3">
                <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[.2em]">Operational Status</h4>
                <div className="glass bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${agent.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                     <span className="text-[10px] font-black text-white uppercase">{agent.status}</span>
                   </div>
                   <select 
                      value={agent.status}
                      onChange={e => onUpdate({ status: e.target.value as any })}
                      className="bg-transparent text-[9px] font-black text-accent uppercase tracking-widest focus:outline-none appearance-none cursor-pointer"
                   >
                     <option value="Draft" className="bg-[#050505]">Draft</option>
                     <option value="Active" className="bg-[#050505]">Active</option>
                   </select>
                </div>
             </div>

             <button 
               onClick={() => onUpdate({ isDefault: !agent.isDefault })}
               className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border transition-all ${agent.isDefault ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white/5 border-white/5 text-text-dim hover:text-white'}`}
             >
               <Star size={16} className={agent.isDefault ? "fill-accent" : ""} />
               <span className="text-[10px] font-black uppercase tracking-widest">{agent.isDefault ? 'Primary Protocol' : 'Set as Primary'}</span>
             </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 bg-[#050505] scrollbar-thin">
          <div className="max-w-4xl mx-auto pb-40">
            {activePanel === 'general' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
                
                <div className="md:hidden space-y-6 bg-white/[0.02] border border-white/5 p-6 rounded-[24px]">
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[.2em]">Operational Status</h4>
                    <div className="glass bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${agent.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                         <span className="text-[10px] font-black text-white uppercase">{agent.status}</span>
                       </div>
                       <select 
                          value={agent.status}
                          onChange={e => onUpdate({ status: e.target.value as any })}
                          className="bg-transparent text-[9px] font-black text-accent uppercase tracking-widest focus:outline-none appearance-none cursor-pointer"
                       >
                         <option value="Draft" className="bg-[#050505]">Draft</option>
                         <option value="Active" className="bg-[#050505]">Active</option>
                       </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => onUpdate({ isDefault: !agent.isDefault })}
                    className={`flex items-center justify-center gap-3 w-full px-4 py-3 rounded-2xl border transition-all ${agent.isDefault ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white/5 border-white/5 text-text-dim hover:text-white'}`}
                  >
                    <Star size={16} className={agent.isDefault ? "fill-accent" : ""} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{agent.isDefault ? 'Primary Protocol' : 'Set as Primary'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField label="Protocol Identifier">
                    <input 
                      type="text" 
                      value={agent.code}
                      onChange={e => onUpdate({ code: e.target.value.toUpperCase() })}
                      className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-accent/50 text-white font-mono font-black"
                    />
                  </FormField>
                  <FormField label="Collective Identity">
                    <input 
                      type="text" 
                      value={agent.name}
                      onChange={e => onUpdate({ name: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-accent/50 text-white font-black"
                    />
                  </FormField>
                </div>
                
                <FormField label="Strategic Mandate">
                  <textarea 
                    value={agent.purpose}
                    onChange={e => onUpdate({ purpose: e.target.value })}
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-[24px] focus:outline-none focus:border-accent/50 text-white text-sm resize-none leading-relaxed"
                  />
                </FormField>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center text-accent ring-1 ring-accent/30">
                      <Wand2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Base Instructions</h3>
                      <p className="text-[10px] text-text-dim/60 font-medium">Fundamental protocol logic for intelligence grounding.</p>
                    </div>
                  </div>
                  <textarea 
                    value={agent.systemPrompt}
                    onChange={e => onUpdate({ systemPrompt: e.target.value })}
                    rows={12}
                    className="w-full bg-black/40 border border-white/5 p-6 rounded-[32px] focus:outline-none focus:border-accent/50 text-white text-xs font-mono leading-[1.8] shadow-inner"
                  />
                </div>
              </motion.div>
            )}

            {activePanel === 'logic' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <LogicField icon={<FileCode size={16} />} label="Data Schematics" value={agent.outputRules} onUpdate={(val: any) => onUpdate({ outputRules: val })} />
                   <LogicField icon={<Bot size={16} />} label="Engineering Standards" value={agent.codeRules} onUpdate={(val: any) => onUpdate({ codeRules: val })} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <LogicField icon={<AlertCircle size={16} />} label="Structural Vetoes" value={agent.validationRules} onUpdate={(val: any) => onUpdate({ validationRules: val })} />
                   <LogicField icon={<Settings2 size={16} />} label="Export Aesthetics" value={agent.formattingRules} onUpdate={(val: any) => onUpdate({ formattingRules: val })} />
                 </div>
              </motion.div>
            )}

            {activePanel === 'parameters' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                          <Globe size={12} className="text-accent" /> Recommended Engine
                         </label>
                       </div>
                       
                       <div className="space-y-2">
                        <button 
                          onClick={() => onUpdate({ preferredModelId: null })}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            !agent.preferredModelId ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white/[0.02] border-white/5 text-text-dim'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">Global Protocol Default</span>
                          {!agent.preferredModelId && <Check size={14} />}
                        </button>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                          {enabledModels.map(m => {
                            const isSelected = agent.preferredModelId === m.id;
                            return (
                              <button 
                                key={m.id}
                                onClick={() => onUpdate({ preferredModelId: m.id })}
                                className={`w-full text-left p-4 rounded-2xl border transition-all ${isSelected ? 'bg-accent/10 border-accent/20' : 'bg-white/[0.01] border-white/5 hover:bg-white/5'}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-text-dim'}`}>{m.name}</span>
                                  {isSelected && <Check size={14} className="text-accent" />}
                                </div>
                                <p className="text-[9px] font-mono text-white/20 truncate">{m.id}</p>
                              </button>
                            );
                          })}
                        </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                         <Thermometer size={14} /> Thermal Entropy
                       </label>
                       <input 
                        type="range" min="0" max="1" step="0.1" value={agent.temperature}
                        onChange={e => onUpdate({ temperature: parseFloat(e.target.value) })}
                        className="w-full accent-accent bg-white/10 rounded-full h-1.5 appearance-none cursor-pointer"
                       />
                       <div className="flex justify-between text-[10px] font-mono text-accent">
                         <span>Deterministic (0.0)</span>
                         <span className="bg-accent/20 px-2 py-0.5 rounded-lg border border-accent/30">{agent.temperature}</span>
                         <span>Creative (1.0)</span>
                       </div>
                    </div>

                    <div className="space-y-4 pt-4">
                       <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                         <Brain size={14} /> Neural Effort
                       </label>
                       <div className="grid grid-cols-3 gap-2">
                        {["low", "medium", "high"].map((effort) => (
                          <button
                            key={effort}
                            onClick={() => onUpdate({ reasoningEffort: effort as any })}
                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                              agent.reasoningEffort === effort ? 'bg-accent border-accent/30 text-white' : 'bg-white/5 border-white/5 text-text-dim'
                            }`}
                          >
                            {effort}
                          </button>
                        ))}
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function FormField({ label, children, icon }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

function LogicField({ icon, label, value, onUpdate }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 px-1">
        {icon} {label}
      </label>
      <textarea 
        value={value}
        onChange={e => onUpdate(e.target.value)}
        rows={6}
        className="w-full bg-white/[0.02] border border-white/5 p-5 rounded-[24px] focus:outline-none focus:border-accent/40 text-xs font-mono text-white leading-relaxed resize-none scrollbar-none"
      />
    </div>
  );
}
