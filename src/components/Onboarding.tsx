import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";

interface TourStep {
  targetId: string;
  title: string;
  content: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "btn-new-project",
    title: "Start Fresh",
    content: "Create a new project to organize your app concepts and conversions."
  },
  {
    targetId: "raw-concept-input",
    title: "Define Your Idea",
    content: "Paste your app concept, feature description, or product idea here."
  },
  {
    targetId: "agent-selector",
    title: "Choose Your Specialist",
    content: "Select an AI Agent tailored for your specific app type."
  },
  {
    targetId: "btn-convert",
    title: "Magic Happens Here",
    content: "Click convert to transform your raw text into structured nested cards."
  },
  {
    targetId: "structured-cards-panel",
    title: "Browse Structure",
    content: "Explore the nested architecture of your app with interactive 3D cards."
  },
  {
    targetId: "markdown-preview-panel",
    title: "Export Ready",
    content: "Review and export your project as professional markdown documentation."
  },
  {
    targetId: "btn-llm-settings",
    title: "Configure Intelligence",
    content: "Set up your OpenRouter API key and manage model intelligence fleet."
  }
];

export function Onboarding() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowWelcome(true);
    }
  }, []);

  const handleDismissWelcome = (startTour = false) => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowWelcome(false);
    if (startTour) {
      setShowTour(true);
    }
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowTour(false);
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTour = () => {
    setShowTour(false);
    setCurrentStep(0);
  };

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full glass-dark rounded-3xl p-8 text-center border border-white/10"
            >
              <div className="w-16 h-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Welcome to Multi-Project App Spec Converter</h2>
              <p className="text-text-dim mb-8 leading-relaxed">
                Transform your raw app concepts into professional, structured architecture and documentation in seconds using OpenRouter AI fleet.
              </p>
              
              <div className="space-y-3 mb-8 text-left">
                {[
                  "Create or open a project",
                  "Paste your app concept in the workspace",
                  "Convert into cards and professional markdown"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent shrink-0">
                      {i + 1}
                    </div>
                    {step}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleDismissWelcome(true)}
                  className="glass-btn-primary w-full"
                >
                  Show me around <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => handleDismissWelcome(false)}
                  className="glass-btn-secondary w-full"
                >
                  I'll figure it out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTour && (
          <TourPopup 
            step={TOUR_STEPS[currentStep]}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTour}
            isFirst={currentStep === 0}
            isLast={currentStep === TOUR_STEPS.length - 1}
            current={currentStep + 1}
            total={TOUR_STEPS.length}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function TourPopup({ step, onNext, onPrev, onSkip, isFirst, isLast, current, total }: any) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTargetRect(el.getBoundingClientRect());
      el.classList.add("ring-4", "ring-accent", "ring-offset-4", "ring-offset-bg", "relative", "z-[210]");
    }
    return () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.classList.remove("ring-4", "ring-accent", "ring-offset-4", "ring-offset-bg", "relative", "z-[210]");
      }
    };
  }, [step]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={onSkip} />
      
      {targetRect && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            top: targetRect.bottom + 16,
            left: Math.max(16, Math.min(window.innerWidth - 336, targetRect.left - (320 - targetRect.width) / 2)),
          }}
          className="w-80 glass-dark rounded-2xl p-5 border border-accent/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              {step.title}
            </h4>
            <div className="text-[10px] font-bold text-text-dim">
              {current} / {total}
            </div>
          </div>
          <p className="text-xs text-text-dim mb-5 leading-relaxed">
            {step.content}
          </p>
          <div className="flex justify-between items-center">
            <button 
              onClick={onSkip}
              className="text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-white transition-colors"
            >
              Skip
            </button>
            <div className="flex gap-2">
              {!isFirst && (
                <button 
                  onClick={onPrev}
                  className="p-1.5 glass hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <button 
                onClick={onNext}
                className="glass-btn-primary !px-4 !py-1.5 !text-[11px]"
              >
                {isLast ? "Finish" : "Next"} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function HelpIcon({ title, content }: { title: string, content: string }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block ml-2 align-middle">
      <button 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-text-dim hover:text-accent transition-colors p-0.5 rounded-full hover:bg-white/5"
      >
        <HelpCircle size={14} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 glass rounded-lg p-3 text-left border border-white/10 pointer-events-none"
          >
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{title}</h5>
            <p className="text-[10px] text-zinc-400 leading-normal">{content}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
