import { tx } from '../../i18n/I18nProvider';
import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import type { AppView } from '../../App';

interface ErrorPageProps {
  onNavigate: (view: AppView) => void;
  message?: string;
}

/**
 * Handles the error page workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function ErrorPage({ onNavigate, message = "The vision you are looking for has not been built yet." }: ErrorPageProps) {
  return (
    <div className="flex-1 overflow-auto bg-[#050505] text-white flex items-center justify-center min-h-[50vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-lg mx-auto p-8"
      >
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <AlertCircle size={48} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{tx("uiLegacy.components.layout.errorpage.001")}</h1>
          <p className="text-lg text-text-dim font-medium italic">"{message}"</p>
        </div>

        <div className="pt-8 flex items-center justify-center gap-4">
          <button 
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors uppercase tracking-widest text-[10px] font-black"
          >
            <Home size={14} />{tx("uiLegacy.components.layout.errorpage.002")}</button>
        </div>
      </motion.div>
    </div>
  );
}
