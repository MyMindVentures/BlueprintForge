import React from "react";
import { motion } from "motion/react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { PipelineStep } from "../../types";

interface PipelineStepListProps {
  steps: PipelineStep[];
  currentStepId: string | null;
}

/**
 * Handles the pipeline step list workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function PipelineStepList({ steps, currentStepId }: PipelineStepListProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <motion.div 
          key={step.id}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
            step.status === "Running" ? "border-accent/40 bg-accent/5 ring-1 ring-accent/20 shadow-lg" : 
            step.status === "Success" ? "border-emerald-500/20 bg-emerald-500/5" :
            step.status === "Failed" ? "border-red-500/20 bg-red-500/5" : "border-white/5 bg-white/[0.01] opacity-30"
          }`}
        >
          <div className="flex items-center gap-4">
            <StepIcon status={step.status} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-tight text-white">{step.name}</h4>
              <p className="text-[10px] text-text-dim/60 font-medium italic">{step.message}</p>
            </div>
          </div>
          {step.status === "Running" && (
            <div className="text-[8px] font-black text-accent uppercase tracking-widest animate-pulse px-2 py-1 bg-accent/20 rounded border border-accent/30">Active</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function StepIcon({ status }: { status: PipelineStep["status"] }) {
  switch (status) {
    case "Running": return <Loader2 size={16} className="animate-spin text-accent" />;
    case "Success": return <CheckCircle2 size={16} className="text-emerald-400" />;
    case "Failed": return <XCircle size={16} className="text-red-400" />;
    default: return <div className="w-4 h-4 rounded-full border-2 border-white/10" />;
  }
}
