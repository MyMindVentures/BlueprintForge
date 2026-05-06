import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

/**
 * Handles the empty state workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
      <div className="w-24 h-24 rounded-[40px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20">
        <Icon size={48} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-white/90">{title}</h3>
        <p className="text-sm text-text-dim max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}
