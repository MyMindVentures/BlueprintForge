import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warn: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * Handles the use toast workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

/**
 * Handles the toast provider workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration !== Infinity) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = (msg: string, d?: number) => toast(msg, "success", d);
  const error = (msg: string, d?: number) => toast(msg, "error", d);
  const warn = (msg: string, d?: number) => toast(msg, "warning", d);
  const info = (msg: string, d?: number) => toast(msg, "info", d);

  return (
    <ToastContext.Provider value={{ toast, success, error, warn, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto min-w-[300px] max-w-[450px] p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl
                ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : ''}
                ${t.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : ''}
                ${t.type === 'warning' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : ''}
                ${t.type === 'info' ? 'bg-accent/10 border-accent/50 text-accent' : ''}
              `}
            >
              <div className="mt-0.5">
                {t.type === 'success' && <CheckCircle size={18} />}
                {t.type === 'error' && <AlertCircle size={18} />}
                {t.type === 'warning' && <AlertTriangle size={18} />}
                {t.type === 'info' && <Info size={18} />}
              </div>
              <div className="flex-1 mr-2">
                <div className="text-xs font-bold uppercase tracking-wider mb-1">
                  {t.type}
                </div>
                <div className="text-sm font-medium text-white/90 leading-relaxed">
                  {t.message}
                </div>
              </div>
              <button 
                onClick={() => removeToast(t.id)}
                className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
