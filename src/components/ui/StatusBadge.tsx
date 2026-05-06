import React from "react";
import { BuildStatus } from "../../types/buildFeed";

type BadgeColor = "success" | "warning" | "error" | "info" | "idle";

interface StatusBadgeProps {
  status?: BuildStatus | BadgeColor;
  label?: string;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ status, label: manualLabel, className = "", dot = true }: StatusBadgeProps) {
  const mapping: Partial<Record<BuildStatus, { color: BadgeColor; label: string }>> = {
    'Open': { color: 'info', label: 'Open' },
    'Claimed': { color: 'warning', label: 'Claimed' },
    'In Progress': { color: 'warning', label: 'In Progress' },
    'Ready for Review': { color: 'warning', label: 'Review' },
    'Accepted': { color: 'success', label: 'Accepted' },
    'Rejected': { color: 'error', label: 'Rejected' },
    'Needs Changes': { color: 'error', label: 'Changes' },
    'Done': { color: 'success', label: 'Done' }
  };

  let color: BadgeColor = 'idle';
  let label: string = manualLabel || '';

  if (status && mapping[status as BuildStatus]) {
    const mapped = mapping[status as BuildStatus]!;
    color = mapped.color;
    label = manualLabel || mapped.label;
  } else if (status) {
    // If it's a direct color keyword
    const colors: BadgeColor[] = ["success", "warning", "error", "info", "idle"];
    if (colors.includes(status as BadgeColor)) {
      color = status as BadgeColor;
      label = manualLabel || status;
    } else {
      color = 'idle';
      label = manualLabel || status;
    }
  }

  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    idle: "bg-white/5 text-white/40 border-white/10"
  };

  const dotStyles = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    idle: "bg-white/20"
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${styles[color] || styles.idle} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[color] || dotStyles.idle} ${color === 'success' ? 'animate-pulse' : ''}`} />}
      {label}
    </div>
  );
}
