import React from "react";
import { motion } from "motion/react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function GlassCard({ children, className = "", onClick, hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      onClick={onClick}
      className={`glass bg-white/[0.03] border border-white/5 rounded-[32px] p-6 transition-all ${hover ? 'hover:bg-white/[0.06] hover:border-white/20' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
