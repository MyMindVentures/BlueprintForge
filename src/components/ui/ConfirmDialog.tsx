import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, X } from "lucide-react";
import { ActionButton } from "./ActionButton";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  variant?: "danger" | "primary";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "primary"
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onCancel}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-surface border border-white/10 rounded-[32px] p-10 max-w-md w-full shadow-2xl z-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
               <button onClick={onCancel} className="text-white/20 hover:text-white transition-colors">
                  <X size={20} />
               </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-6">
               <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${variant === 'danger' ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20' : 'bg-accent/10 text-accent ring-1 ring-accent/20'}`}>
                  <AlertCircle size={32} />
               </div>
               
               <div className="space-y-2">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h3>
                 <p className="text-text-dim text-sm leading-relaxed">{message}</p>
               </div>

               <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-widest text-text-dim hover:bg-white/10 hover:text-white transition-all order-2 sm:order-1"
                  >
                    {cancelLabel}
                  </button>
                  <ActionButton
                    label={confirmLabel}
                    onClick={onConfirm}
                    variant={variant === 'danger' ? 'primary' : 'primary'}
                    className={`flex-1 !px-8 !py-4 !h-auto !rounded-2xl !text-[11px] !font-black !uppercase !tracking-widest order-1 sm:order-2 ${variant === 'danger' ? '!bg-red-500 shadow-[0_15px_30px_rgba(239,68,68,0.3)]' : ''}`}
                  />
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
