import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, XCircle, Zap, Terminal, ChevronDown, ChevronUp
} from "lucide-react";
import { PipelineJob } from "../../types";
import { PipelineStepList } from "./PipelineStepList";
import { PipelineLogViewer } from "./PipelineLogViewer";
import { GlassPanel } from "../ui/GlassPanel";

interface PipelineOverlayProps {
  job: PipelineJob;
  onClose: () => void;
  onRetry: () => void;
  onGenerateImages?: () => void;
}

/**
 * Handles the pipeline progress overlay workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function PipelineProgressOverlay({ job, onClose, onRetry, onGenerateImages }: PipelineOverlayProps) {
  const [showLogs, setShowLogs] = useState(false);
  const overallProgress = (job.steps.filter(s => s.status === "Success").length / job.steps.length) * 100;
  const isFinished = job.status === "Success" || job.status === "Failed";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      
      <motion.div initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="relative w-full max-w-2xl h-full sm:h-auto max-h-full flex flex-col justify-end sm:justify-center">
        <GlassPanel className="bg-black/40 overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-accent/10 blur-[50px] sm:blur-[100px] rounded-full -mr-24 -mt-24 sm:-mr-48 sm:-mt-48 pointer-events-none" />
          
          <div className="p-6 md:p-10 border-b border-white/5 relative z-10 shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center ring-1 transition-all duration-700 shrink-0 ${
                job.status === "Failed" ? "bg-red-500/20 text-red-400 ring-red-500/30" : 
                job.status === "Success" ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30" : 
                "bg-accent/20 text-accent ring-accent/30"
              }`}>
                {job.status === "Running" ? <Zap className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" /> : 
                 job.status === "Success" ? <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" /> : 
                 job.status === "Failed" ? <XCircle className="w-6 h-6 sm:w-8 sm:h-8" /> : <Zap className="w-6 h-6 sm:w-8 sm:h-8" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase mb-1 truncate">{job.status}</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-text-dim uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                  <span className="truncate">{job.status === "Running" ? "Sequence active..." : "Protocol terminated."}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-10 py-5 border-b border-white/5 bg-white/[0.02] relative z-10 shrink-0">
            <div className="flex justify-between items-center mb-3 text-[10px] font-black uppercase tracking-widest">
               <span className="text-white/40">Sequence Progress</span>
               <span className="text-white font-mono">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div 
                animate={{ width: `${overallProgress}%` }}
                className={`h-full rounded-full transition-all duration-500 ${job.status === "Failed" ? "bg-red-500" : "bg-accent shadow-[0_0_20px_rgba(59,130,246,0.5)]"}`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 relative z-10 scrollbar-thin min-h-0">
             <PipelineStepList steps={job.steps} currentStepId={job.currentStepId} />
          </div>

          <div className="border-t border-white/5 bg-black/20 relative z-10 shrink-0">
             <button 
               onClick={() => setShowLogs(!showLogs)}
               className="w-full h-12 flex items-center justify-between px-6 md:px-10 text-[10px] font-black text-white/30 uppercase tracking-widest hover:bg-white/5"
             >
               <div className="flex items-center gap-2"><Terminal size={14} /> Details</div>
               {showLogs ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
             </button>
             <AnimatePresence>
               {showLogs && <PipelineLogViewer logs={job.logs} />}
             </AnimatePresence>
          </div>

          {isFinished && (
            <div className="p-6 md:p-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-4 relative z-10 shrink-0">
              {job.status === "Failed" && (
                <button onClick={onRetry} className="glass-btn-secondary w-full sm:w-auto !h-12 sm:!h-14 !px-8">Retry</button>
              )}
              {job.status === "Success" && onGenerateImages && (
                <button 
                  onClick={() => {
                    onClose();
                    onGenerateImages();
                  }} 
                  className="glass-btn-secondary w-full sm:w-auto !h-12 sm:!h-14 !px-8 text-accent border-accent/20"
                >
                  Generate Screen UI Images
                </button>
              )}
              <button onClick={onClose} className="glass-btn-primary w-full sm:w-auto !h-12 sm:!h-14 !px-10">
                {job.status === "Success" ? "Launch Workspace" : "Close"}
              </button>
            </div>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
}
