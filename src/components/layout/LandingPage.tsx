import React from "react";
import { motion } from "motion/react";
import { Cpu, Zap, Target, Users, ArrowRight } from "lucide-react";

export function LandingPage({ onEnter }: { onEnter?: () => void }) {
  return (
    <div className="flex-1 overflow-auto bg-[#050505] text-white scrollbar-thin selection:bg-accent/30 text-balance">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-32">
        
        {/* HERO / SOLUTION SECTION */}
        <section id="solution" className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.3em]">
            <Cpu size={14} className="animate-pulse" />
            The Architect System
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] max-w-4xl uppercase">
            Transforming <span className="text-accent underline decoration-white/10 underline-offset-8 italic">Vision</span> into Absolute Reality.
          </h1>
          <p className="text-lg md:text-xl text-text-dim max-w-2xl leading-relaxed font-medium">
            A high-signal workspace for neurodiverse founders and elite builders. We convert raw concepts into technical blueprints and ship them with precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
             <button className="glass-btn-primary !px-12 !py-4 shadow-[0_0_50px_rgba(255,107,0,0.3)]">
               Start Building
             </button>
             <button className="glass-btn-secondary !px-12 !py-4 border-white/5 hover:bg-white/5">
               Explore Vision
             </button>
          </div>
        </section>

        {/* WAAROM DIT BESTAAT SECTION */}
        <section id="waarom-dit-bestaat" className="py-32 flex justify-center bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent">
          <div className="max-w-2xl w-full px-6 flex flex-col items-center">
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1.2, ease: "easeOut" }}
               className="space-y-16 text-center"
             >
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">
                    Mission Statement
                  </h2>
                  <div className="w-px h-16 bg-gradient-to-b from-accent to-transparent mx-auto" />
                </div>

                <div className="space-y-12">
                  <p className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white text-balance">
                    Dit begon niet als een <span className="text-accent italic">business</span>.<br />
                    <span className="text-white/30">Maar als een besef.</span>
                  </p>

                  <div className="space-y-8 text-xl md:text-2xl text-text-dim leading-relaxed font-medium max-w-xl mx-auto">
                    <p>Dat sommige mensen anders denken. Sneller zien. Dieper voelen.</p>
                    <p>En ideeën hebben die moeilijk uit te leggen zijn — maar wel kloppen.</p>
                  </div>

                  <p className="text-5xl md:text-6xl font-black tracking-tighter text-white py-8">
                    Ik ben één van die mensen.
                  </p>

                  <div className="space-y-8 text-xl md:text-2xl text-text-dim leading-relaxed font-medium max-w-xl mx-auto text-balance">
                    <p>Jarenlang probeerde ik in systemen te passen die niet voor mij gemaakt waren.</p>
                    <p className="border-l-2 border-accent/30 pl-8 text-left py-4 italic text-white/90">
                      "Mijn kracht is niet aanpassen.<br />
                      <span className="text-accent font-black uppercase tracking-widest not-italic">Mijn kracht is creëren.</span>"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 text-sm font-black uppercase tracking-widest text-white/40 py-12">
                    <div className="flex items-center justify-center gap-6">
                      <div className="w-12 h-px bg-white/10" />
                      <p>Ideeën zien waar anderen ze missen</p>
                      <div className="w-12 h-px bg-white/10" />
                    </div>
                    <div className="flex items-center justify-center gap-6">
                      <div className="w-12 h-px bg-white/10" />
                      <p>Bestaande dingen beter maken</p>
                      <div className="w-12 h-px bg-white/10" />
                    </div>
                  </div>

                  <div className="pt-16 space-y-12">
                    <p className="text-4xl font-black text-white uppercase tracking-tight">Daarom bouwen we dit.</p>
                    <p className="text-xl text-text-dim leading-relaxed max-w-lg mx-auto">
                      Een Venture Studio waar neurodiverse denkers<br />
                      niet worden aangepast — <br />
                      <span className="text-accent font-black uppercase tracking-widest">maar versterkt.</span>
                    </p>
                  </div>

                  <div className="pt-24 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                      <Users size={20} className="text-white/20" />
                    </div>
                    <p className="font-mono text-xs tracking-[0.4em] uppercase text-white/20">— Kevin De Vlieger</p>
                  </div>
                </div>
             </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-24 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-6">
              <h2 className="text-4xl font-black uppercase tracking-tight">How it works</h2>
              <p className="text-text-dim text-lg leading-relaxed max-w-md">
                We bridge the gap between abstract founder vision and concrete technical execution. No filler, just high-signal architecture.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: Target, title: "Vision Capture", desc: "Founders define high-level strategic direction." },
                { icon: Zap, title: "AI Distillation", desc: "Our agent fleet converts concepts into structured specs." },
                { icon: Users, title: "Builder Sync", desc: "Elite vibe coders claim and execute build requests." },
                { icon: Zap, title: "Ship & Scale", desc: "Rapid iterations turn blueprints into production code." }
              ].map((step, i) => (
                <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 hover:bg-white/[0.04] hover:border-white/10 transition-colors">
                  <div className="w-10 h-10 bg-accent/20 text-accent rounded-xl flex items-center justify-center">
                    <step.icon size={20} />
                  </div>
                  <h3 className="font-bold text-white uppercase tracking-widest text-sm">{step.title}</h3>
                  <p className="text-xs text-text-dim leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="text-center py-20 bg-accent/5 rounded-[48px] border border-accent/20">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6 text-balance">Ready to architect?</h2>
          <button className="glass-btn-primary !px-12 !py-4 shadow-2xl">
            Open Laboratory <ArrowRight size={18} className="ml-2" />
          </button>
        </section>

      </div>
    </div>
  );
}
