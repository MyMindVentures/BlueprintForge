import React from "react";
import { motion } from "motion/react";
import { Brain, Star, Clock, Copy, Trash2, Settings2, LayoutTemplate, Cpu } from "lucide-react";
import { AIAgent } from "../../types";
import { GlassCard } from "../ui/GlassCard";
import { StatusBadge } from "../ui/StatusBadge";
import { useI18n } from '../../i18n/I18nProvider';

interface AgentCardProps {
  agent: AIAgent;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSetDefault: (id: string) => void;
}

/**
 * Handles the agent card workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function AgentCard({ agent, onOpen, onDelete, onDuplicate, onSetDefault }: AgentCardProps) {
  const { formatRelativeTime } = useI18n();
  return (
    <GlassCard 
      onClick={() => onOpen(agent.id)}
      className={`h-full flex flex-col relative overflow-hidden ${agent.isDefault ? 'ring-2 ring-accent/30 shadow-[0_24px_48px_-12px_rgba(255,107,0,0.15)] bg-white/[0.05]' : ''}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />

      <div className="flex items-start justify-between mb-8 z-10">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 glass bg-black/40 rounded-lg text-[11px] text-accent font-black font-mono tracking-widest border border-white/5">
            {agent.code}
          </div>
          <StatusBadge 
            label={agent.status} 
            status={agent.status === 'Active' ? 'success' : 'idle'} 
          />
        </div>
        
        {agent.isDefault && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-accent/40 mr-[-10px]">
             <Star size={12} className="fill-white" />
             MASTER
          </div>
        )}
      </div>

      <div className="flex-1 z-10 relative">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/5">
          <Brain size={28} className="text-white opacity-80 group-hover:text-accent transition-all" />
        </div>
        
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-accent transition-colors leading-tight">
          {agent.name}
        </h3>
        <p className="text-text-dim text-[13px] leading-relaxed mb-8 opacity-70 group-hover:opacity-100 transition-opacity line-clamp-3">
          {agent.purpose || "Master architectural strategist."}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="p-4 glass bg-black/20 rounded-2xl border-white/5">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Architecture</span>
              <div className="flex items-center gap-2">
                 <LayoutTemplate size={12} className="text-accent" />
                 <span className="text-[10px] text-white font-black uppercase truncate">{agent.outputType.split(' ')[0]}</span>
              </div>
            </div>
            
            <div className="p-4 glass bg-black/20 rounded-2xl border-white/5">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Engine</span>
              <div className="flex items-center gap-2">
                 <Cpu size={12} className="text-emerald-400" />
                 <span className="text-[10px] text-white font-black uppercase truncate">{agent.preferredModelId?.split('/').pop() || "Auto"}</span>
              </div>
            </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-[10px] font-black text-text-dim uppercase tracking-widest opacity-60">
          <Clock size={12} />
          {formatRelativeTime(agent.updatedAt)}
        </div>
        
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
           <IconButton 
             icon={<Copy size={15} />} 
             title="Duplicate" 
             onClick={() => onDuplicate(agent.id)} 
           />
           {!agent.isDefault && (
             <IconButton 
               icon={<Trash2 size={15} />} 
               variant="danger" 
               title="Decommission" 
               onClick={() => { if(confirm("Decommission agent?")) onDelete(agent.id); }} 
             />
           )}
           <div className="h-4 w-[1px] bg-white/10 mx-1" />
           <button
              onClick={() => onOpen(agent.id)}
              className="px-5 py-2 glass rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
           >
              Configure
           </button>
        </div>
      </div>
    </GlassCard>
  );
}

function IconButton({ icon, title, onClick, variant = "normal" }: { icon: React.ReactNode; title: string; onClick: () => void; variant?: "normal" | "danger" }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-2 glass rounded-xl transition-all ${
        variant === "danger" 
          ? "hover:bg-red-500/20 text-text-dim hover:text-red-400 border-white/10" 
          : "hover:bg-white/10 text-white/40 hover:text-white border-white/10"
      }`}
    >
      {icon}
    </button>
  );
}
