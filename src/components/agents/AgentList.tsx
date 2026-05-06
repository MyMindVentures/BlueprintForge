import React, { useState, useMemo } from "react";
import { Plus, Brain, Users } from "lucide-react";
import { AIAgent } from "../../types";
import { AgentCard } from "./AgentCard";
import { SearchInput } from "../ui/SearchInput";
import { HelpIcon } from "../Onboarding";
import { EmptyState } from "../ui/EmptyState";

interface AgentListProps {
  agents: AIAgent[];
  onNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AgentList({ agents, onNew, onOpen, onDelete, onDuplicate, onSetDefault }: AgentListProps) {
  const [search, setSearch] = useState("");

  const filteredAgents = useMemo(() => {
    return agents.filter(a => 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.purpose?.toLowerCase().includes(search.toLowerCase())
    );
  }, [agents, search]);

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8 md:p-12 scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-40">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                <Brain size={12} />
                Strategic Intelligence
             </div>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
               AI Architect <span className="text-accent underline decoration-white/10 underline-offset-8">Guild</span>
             </h1>
             <div className="text-text-dim text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed italic">
               Deploy specialized intelligence modules optimized for distinct software engineering domains.
               <HelpIcon title="Agent Protocol" content="Agents encapsulate specific system instructions. Create specialists for Mobile, Desktop, SaaS, or Web3 architectures." />
             </div>
          </div>
          
          <button
            onClick={onNew}
            className="glass-btn-primary w-full lg:w-auto !h-14 sm:!h-16 !px-10 !text-sm !font-black !rounded-[24px] shadow-[0_20px_40px_rgba(255,107,0,0.2)]"
          >
            <Plus size={20} />
            Recruit Specialist
          </button>
        </div>

        {/* Browser Section */}
        <div className="pt-4 max-w-xl">
           <SearchInput 
             value={search} 
             onChange={setSearch} 
             placeholder="Search by agent name, code, or specialty..."
             className="w-full"
           />
        </div>

        {/* Content Section */}
        {agents.length === 0 ? (
          <div className="pt-20">
            <EmptyState 
              icon={Users} 
              title="No specialists recruited" 
              description="Your guild is empty. Start by recruiting a master architect or importing standard protocols."
              action={
                <button onClick={onNew} className="glass-btn-primary !px-10 !py-4">
                  Initialize Agent
                </button>
              }
            />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="pt-20">
             <EmptyState 
                icon={Plus} 
                title="Protocol not found" 
                description={`We couldn't find any specialist matching "${search}".`}
                action={
                  <button onClick={() => setSearch("")} className="text-accent font-black uppercase text-[11px] tracking-widest hover:underline">
                    Reset search
                  </button>
                }
             />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map((agent) => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onOpen={onOpen}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onSetDefault={onSetDefault}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
