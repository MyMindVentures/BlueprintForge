import { tx } from '../../i18n/I18nProvider';
import React from 'react';
import { motion } from 'motion/react';
import { Target, Github, User, Clock, ArrowUpRight } from 'lucide-react';
import { BuildRequest } from '../../types/buildFeed';
import { StatusBadge } from '../ui/StatusBadge';

interface CurrentFocusProps {
  focusedRequests: BuildRequest[];
  onClaim?: (id: string) => void;
  isAdmin?: boolean;
  onRemoveFocus?: (id: string) => void;
}

/**
 * Handles the current focus workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function CurrentFocus({ focusedRequests, onClaim, isAdmin, onRemoveFocus }: CurrentFocusProps) {
  if (focusedRequests.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <span className="text-accent animate-pulse">🔥</span>{tx("uiLegacy.components.buildfeed.currentfocus.001")}</h2>
          <p className="text-xs text-text-dim mt-1 font-medium italic">{tx("uiLegacy.components.buildfeed.currentfocus.002")}</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
          {focusedRequests.length}{tx("uiLegacy.components.buildfeed.currentfocus.003")}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {focusedRequests.map((req, idx) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-accent/40 transition-all shadow-xl hover:shadow-accent/5"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-bold text-white uppercase tracking-wide leading-tight group-hover:text-accent transition-colors">
                  {req.polished_title}
                </h3>
                <StatusBadge status={req.status} />
              </div>

              <div className="space-y-3 pb-4 border-b border-white/5">
                <div>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{tx("uiLegacy.components.buildfeed.currentfocus.004")}</p>
                  <p className="text-xs text-text-dim line-clamp-2 leading-relaxed">
                    {req.focus_reason || req.polished_context}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{tx("uiLegacy.components.buildfeed.currentfocus.005")}</p>
                  <p className="text-xs text-text-dim line-clamp-2 leading-relaxed">
                    {req.polished_change}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  {req.claimed_by ? (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                      <User size={12} className="text-green-400" />
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.currentfocus.006")}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onClaim?.(req.id)}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-accent text-white text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
                    >{tx("uiLegacy.components.buildfeed.currentfocus.007")}</button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                   {req.github_issue_url && (
                     <a 
                       href={req.github_issue_url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-text-dim hover:text-white transition-colors"
                       title={tx("uiLegacy.components.buildfeed.currentfocus.008")}
                     >
                       <Github size={16} />
                     </a>
                   )}
                   <div className="flex items-center gap-1 text-[10px] font-mono text-text-dim">
                     <Clock size={12} />
                     <span>{new Date(req.updated_at).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => onRemoveFocus?.(req.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title={tx("uiLegacy.components.buildfeed.currentfocus.009")}
                >
                  ×
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
