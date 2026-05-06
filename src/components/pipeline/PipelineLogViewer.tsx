import { tx } from '../../i18n/I18nProvider';
import React from "react";
import { motion } from "motion/react";
import { PipelineLog } from "../../types";

interface PipelineLogViewerProps {
  logs: PipelineLog[];
}

/**
 * Handles the pipeline log viewer workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function PipelineLogViewer({ logs }: PipelineLogViewerProps) {
  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 200, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-t border-white/5 bg-black/40"
    >
      <div className="p-8 h-full overflow-y-auto font-mono text-[10px] space-y-2 scrollbar-thin">
        {logs.length === 0 ? (
          <span className="text-zinc-600 italic">{tx("uiLegacy.components.pipeline.pipelinelogviewer.001")}</span>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
              <span className="text-accent shrink-0 uppercase">[{log.step}]</span>
              <span className="text-zinc-400 leading-tight">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
