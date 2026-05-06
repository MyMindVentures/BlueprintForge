import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, Layers, Layout, Users, Shield, Cpu, Info, FileText } from 'lucide-react';
import { CardNode, CardNodeType } from '../../types';
import { GlassCard } from '../ui/GlassCard';

interface NestedCardTreeProps {
  nodes: CardNode[];
}

const typeIcons: Record<CardNodeType, React.ReactNode> = {
  section: <Layers size={14} />,
  screen: <Layout size={14} />,
  role: <Users size={14} />,
  capability: <Shield size={14} />,
  function: <Cpu size={14} />,
  legend: <Info size={14} />,
  item: <FileText size={14} />
};

const typeColors: Record<CardNodeType, string> = {
  section: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  screen: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  role: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  capability: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  function: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  legend: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  item: "bg-white/5 text-zinc-300 border-white/10"
};

const CardItem: React.FC<{ node: CardNode; level: number }> = ({ node, level }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-4 last:mb-0">
      <GlassCard 
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`group flex items-start gap-4 p-5 rounded-[24px] cursor-pointer transition-all duration-500 ${isExpanded && hasChildren ? 'bg-white/[0.05]' : 'bg-white/[0.02]'}`}
      >
        <div className="mt-1.5 shrink-0 transition-transform group-hover:scale-110">
          {hasChildren ? (
            <div className={`text-white/20 group-hover:text-accent transition-colors ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
              <ChevronDown size={14} />
            </div>
          ) : (
            <div className="w-1.5 h-1.5 bg-accent/40 rounded-full mt-1.5 ml-1.5 ring-4 ring-accent/10" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2.5 mb-3">
            <span className="text-[9px] font-mono font-black text-white/30 px-2 py-0.5 glass rounded-lg border border-white/5 uppercase tracking-widest bg-black/40">
              {node.code}
            </span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ${typeColors[node.type] || typeColors.item}`}>
               {typeIcons[node.type] || typeIcons.item}
               {node.type}
            </div>
            <h4 className="text-[14px] font-black text-white tracking-tight break-words flex-1 min-w-[200px]" title={node.title}>
              {node.title}
            </h4>
          </div>
          
          <p className="text-[12px] text-text-dim/80 leading-relaxed group-hover:text-white/90 transition-colors">
            {node.description}
          </p>
        </div>
      </GlassCard>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden ml-6 mt-4 border-l-2 border-white/5 pl-6 space-y-4"
          >
            {node.children.map(child => (
              <CardItem key={child.id} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const NestedCardTree: React.FC<NestedCardTreeProps> = ({ nodes }) => {
  return (
    <div className="space-y-4">
      {nodes.map((node, i) => (
        <motion.div
           key={node.id}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: i * 0.05 }}
        >
           <CardItem node={node} level={0} />
        </motion.div>
      ))}
    </div>
  );
};
