import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Loader2, 
  Check, 
  AlertCircle,
} from "lucide-react";

interface ActionButtonProps {
  label: string;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  disabledReason?: string;
  onClick: () => Promise<void> | void;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  icon?: ReactNode;
  disabled?: boolean;
  title?: string;
}

export function ActionButton({
  label,
  loadingLabel = "Running...",
  successLabel = "Success",
  errorLabel = "Failed",
  disabledReason,
  onClick,
  className = "",
  variant = "primary",
  icon,
  disabled,
  title
}: ActionButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "idle" || disabled) return;

    setStatus("loading");
    try {
      await onClick();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const variants = {
    primary: "bg-accent text-white hover:bg-accent/90",
    secondary: "bg-surface border border-border text-text-dim hover:text-white hover:bg-border",
    danger: "bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white",
    ghost: "bg-transparent hover:bg-surface text-text-dim hover:text-white",
    outline: "bg-transparent border border-border text-text-dim hover:text-white hover:bg-surface"
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || status === "loading"}
      aria-busy={status === "loading"}
      aria-disabled={disabled || status === "loading"}
      title={title || disabledReason}
      className={`
        relative group flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200
        ${variants[variant]}
        ${(disabled || status === "loading") ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Loader2 size={14} className="animate-spin" />
            <span>{loadingLabel}</span>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-emerald-500"
          >
            <Check size={14} />
            <span>{successLabel}</span>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-red-500"
          >
            <AlertCircle size={14} />
            <span>{errorLabel}</span>
          </motion.div>
        )}

        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            {icon}
            <span>{label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
