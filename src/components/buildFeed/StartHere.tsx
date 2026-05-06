import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, Target, Github, Rocket, ArrowRight, Zap } from 'lucide-react';

interface StartHereProps {
  onAction: (action: 'profile' | 'focus' | 'repo') => void;
}

/**
 * Handles the start here workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function StartHere({ onAction }: StartHereProps) {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Profile",
      desc: "Set up your Vibe Coder identity and skills.",
      id: "profile"
    },
    {
      icon: Target,
      title: "Pick Focus",
      desc: "Choose a request from the Current Focus list.",
      id: "focus"
    },
    {
      icon: Github,
      title: "Open Issue",
      desc: "Go to the GitHub issue to see technical details.",
      id: "repo"
    },
    {
      icon: Rocket,
      title: "Claim & Ship",
      desc: "Claim the ticket and start building right away.",
      id: "focus"
    }
  ];

  return (
    <div className="relative p-8 md:p-12 rounded-[40px] bg-gradient-to-br from-accent/5 to-transparent border border-white/5 overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.03)_0%,transparent_70%)]" />
      
      <div className="relative z-10 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em]">
               <Zap size={12} fill="currentColor" />
               Vibe Coder Onboarding
             </div>
             <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">New here? Start here.</h2>
             <p className="text-lg text-text-dim max-w-xl leading-relaxed">
               “Don’t overthink it. Pick one focus request, open the GitHub issue, claim it, and ship one useful improvement.”
             </p>
          </div>
          
          <div className="hidden lg:block text-right space-y-2">
            <p className="text-2xl font-black text-white/10 uppercase tracking-tighter select-none">BUILD REAL PRODUCTS</p>
            <p className="text-2xl font-black text-white/5 uppercase tracking-tighter select-none">SHIP FAST. SHIP VALUABLE.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-all group/card"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center text-accent font-black text-sm z-20">
                {idx + 1}
              </div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover/card:scale-110 transition-transform">
                  <step.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase tracking-widest text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-text-dim leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-white/10">
                  <ArrowRight size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => onAction('profile')}
              className="glass-btn-primary !px-8 !py-3 flex items-center gap-2 group/btn"
            >
              <UserPlus size={16} />
              Create Builder Profile
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onAction('focus')}
              className="glass-btn-secondary !px-8 !py-3 flex items-center gap-2"
            >
              <Target size={16} />
              View Current Focus
            </button>
            <button 
              onClick={() => onAction('repo')}
              className="glass-btn-secondary !px-8 !py-3 flex items-center gap-2 border-white/5"
            >
              <Github size={16} />
              Open GitHub Repo
            </button>
        </div>
      </div>
    </div>
  );
}
