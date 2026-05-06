import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, ImageIcon, Terminal, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { ImagePipeline } from "../../types";
import { PipelineLogViewer } from "./PipelineLogViewer";
import { GlassPanel } from "../ui/GlassPanel";

interface ImagePipelineOverlayProps {
  pipeline: ImagePipeline;
  onClose: () => void;
}

/**
 * Handles the image pipeline progress overlay workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function ImagePipelineProgressOverlay({ pipeline, onClose }: ImagePipelineOverlayProps) {
  const [showLogs, setShowLogs] = useState(false);
  const isFinished = pipeline.status === "Success" || pipeline.status === "Failed";
  const progress = (pipeline.completedScreens / pipeline.totalScreens) * 100;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      
      <motion.div initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="relative w-full max-w-2xl h-full sm:h-auto max-h-full flex flex-col justify-end sm:justify-center">
        <GlassPanel className="bg-black/40 overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-accent/10 blur-[50px] sm:blur-[100px] rounded-full -mr-24 -mt-24 sm:-mr-48 sm:-mt-48 pointer-events-none" />
          
          <div className="p-6 md:p-10 border-b border-white/5 relative z-10 shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center ring-1 transition-all duration-700 shrink-0 ${
                pipeline.status === "Failed" ? "bg-red-500/20 text-red-400 ring-red-500/30" : 
                pipeline.status === "Success" ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30" : 
                "bg-accent/20 text-accent ring-accent/30"
              }`}>
                {pipeline.status === "Running" ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-accent" /> : 
                 pipeline.status === "Success" ? <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" /> : 
                 pipeline.status === "Failed" ? <XCircle className="w-6 h-6 sm:w-8 sm:h-8" /> : <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase mb-1 truncate">
                  {pipeline.status === "Running" ? "Rendering UI" : pipeline.status}
                </h2>
                <p className="text-[9px] sm:text-[10px] font-black text-text-dim uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                  <span className="truncate">Generating Screen Mockups</span>
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-10 py-5 sm:py-8 border-b border-white/5 bg-white/[0.02] relative z-10 overflow-y-auto min-h-0 flex-1">
            <div className="flex justify-between items-center mb-4">
               <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Overall Progress</span>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                     {pipeline.completedScreens} <span className="text-white/20 font-light mx-1 sm:mx-2">/</span> {pipeline.totalScreens}
                  </div>
               </div>
               <div className="text-right max-w-[50%]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</span>
                  <div className="text-accent font-mono text-xs sm:text-sm mt-1 uppercase tracking-tighter truncate">
                     {pipeline.currentScreenCode || "Awaiting Data..."}
                  </div>
               </div>
            </div>
            
            <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div 
                animate={{ width: `${progress}%` }}
                className={`h-full rounded-full transition-all duration-500 bg-accent shadow-[0_0_20px_rgba(59,130,246,0.3)]`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Completed</div>
                  <div className="text-xl font-black text-emerald-400">{pipeline.completedScreens}</div>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Failed</div>
                  <div className="text-xl font-black text-red-400">{pipeline.failedScreens}</div>
               </div>
            </div>
          </div>

          <div className="border-t border-white/5 bg-black/20 relative z-10 shrink-0">
             <button 
               onClick={() => setShowLogs(!showLogs)}
               className="w-full h-12 flex items-center justify-between px-6 md:px-10 text-[10px] font-black text-white/30 uppercase tracking-widest hover:bg-white/5"
             >
               <div className="flex items-center gap-2"><Terminal size={14} /> Production Logs</div>
               {showLogs ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
             </button>
             <AnimatePresence>
               {showLogs && <PipelineLogViewer logs={pipeline.logs} />}
             </AnimatePresence>
          </div>

          {isFinished && (
            <div className="p-6 md:p-10 border-t border-white/5 flex items-center justify-end gap-4 relative z-10 shrink-0">
              <button 
                onClick={onClose} 
                className="glass-btn-primary w-full sm:w-auto !h-12 sm:!h-14 !px-10 !text-[10px] sm:!text-[11px] !font-black !uppercase !tracking-widest"
              >
                View UI Assets
              </button>
            </div>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
}
