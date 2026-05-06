import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function GlassPanel({ children, className = "", id }: GlassPanelProps) {
  return (
    <div 
      id={id}
      className={`glass bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
