import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, Rocket, Play, Clock, ChevronRight, 
  Download, Video, Zap, Github, Terminal, 
  Layers, UserPlus, Target, Radio, Star, Info
} from 'lucide-react';
import { useGuide } from '../../hooks/useGuide';
import { formatDistanceToNow } from 'date-fns';
import { AutoDemoRecorder } from './AutoDemoRecorder';
import { guideSections, screenGuidance, statusGlossary } from '../../content/guides/blueprintGuides';
import { StatusBadge } from '../ui/StatusBadge';

/**
 * Presents the central self-explaining BlueprintForge guide, changelog and demo recorder.
 * Used by visitors, builders, founders and observers to understand screens, roles, statuses and next actions.
 */
export function GuidePage() {
  const { latestVersion, flows, recordings, currentSession, startDemoSession } = useGuide();
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const coreCards = [
    { icon: Layers, title: "Founder Vision", desc: "Where high-level goals and product direction are set.", page: "vision" },
    { icon: Zap, title: "Bootstrap Page", desc: "The movement onboarding and ticket generator.", page: "bootstrap" },
    { icon: Radio, title: "Live Build Feed", desc: "Real-time stream of all build requests.", page: "feed_coder" },
    { icon: Target, title: "Current Focus", desc: "The top 3 immediate priority items for the architect.", page: "feed_coder" },
    { icon: UserPlus, title: "Coder Profiles", desc: "Set up your identity and claim your first ticket.", page: "coder_profile" },
    { icon: Star, title: "Reputation", desc: "Earn stars by shipping accepted improvements.", page: "coder_directory" }
  ];

  return (
    <div className="flex-1 overflow-auto bg-[#050505] text-white scrollbar-thin selection:bg-accent/30 selection:text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-24 space-y-32">
        
        {/* HERO */}
        <section className="text-center space-y-12 py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.03)_0%,transparent_70%)]" />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.3em] mx-auto">
              <HelpCircle size={14} fill="currentColor" />
              Living Platform Guide
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tight leading-[0.85]">
              BlueprintForge AI Guide
            </h1>
            <p className="text-lg md:text-xl text-text-dim max-w-2xl mx-auto font-medium">
              The living guide to the platform, updated with every new version. Discover how vision becomes reality.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 pt-4">
             <button 
               onClick={() => setIsDemoRunning(true)}
               className="glass-btn-primary !px-10 !py-4 flex items-center gap-3 shadow-[0_0_40px_rgba(255,107,0,0.2)]"
              >
               <Play size={18} fill="currentColor" />
               Watch Auto Demo
             </button>
             <button className="glass-btn-secondary !px-10 !py-4 border-white/5">
                Version v{latestVersion?.version}
             </button>
             <button className="glass-btn-secondary !px-10 !py-4 border-white/5">
                GitHub Repo
             </button>
          </div>
        </section>

        {/* LATEST VERSION SECTION */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[48px] p-8 md:p-16 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                   <Terminal size={20} />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Latest Version v{latestVersion?.version}</h2>
              </div>
              <p className="text-3xl font-black text-white/90 uppercase tracking-tight">"{latestVersion?.release_title}"</p>
            </div>
            <div className="text-[10px] font-black text-text-dim uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
               Released: {latestVersion ? new Date(latestVersion.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
             <div className="space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-accent uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} fill="currentColor" /> New Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {latestVersion?.new_features.map((f, i) => (
                       <div key={i} className="flex gap-3 text-sm text-white/70 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                         <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                         {f}
                       </div>
                     ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h3 className="text-xs font-black text-text-dim uppercase tracking-widest flex items-center gap-2">Fixed Issues</h3>
                      <ul className="space-y-2">
                        {latestVersion?.fixed_issues.map((f, i) => (
                          <li key={i} className="text-xs text-text-dim flex gap-3">
                            <span className="text-green-500/50">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-xs font-black text-text-dim uppercase tracking-widest flex items-center gap-2">Known Limitations</h3>
                      <ul className="space-y-2">
                        {latestVersion?.known_limitations.map((l, i) => (
                          <li key={i} className="text-xs text-text-dim flex gap-3">
                            <span className="text-amber-500/50">!</span> {l}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="bg-black/40 border border-white/5 p-6 rounded-3xl space-y-4">
                   <h4 className="text-[10px] font-black text-text-dim uppercase tracking-widest">Release Notes</h4>
                   <p className="text-xs text-white/60 leading-relaxed italic">
                     "{latestVersion?.release_notes}"
                   </p>
                </div>
                <button className="w-full glass-btn-secondary !text-[10px] !py-3 !font-black uppercase tracking-[0.2em] border-white/5 flex items-center justify-center gap-2">
                   <Github size={14} /> Full GitHub Changelog
                </button>
             </div>
          </div>
        </section>

        {/* WHAT IS BLUEPRINTFORGE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">The Anatomy</h2>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">What is<br />BlueprintForge?</h3>
              </div>
              <p className="text-xl text-text-dim leading-relaxed font-medium">
                BlueprintForge AI is a bootstrap platform where a founder’s raw thoughts, visions and app concepts become structured build tickets.
              </p>
              <div className="flex items-center gap-4 p-6 bg-accent/5 border-l-4 border-accent rounded-r-3xl">
                 <Info size={24} className="text-accent shrink-0" />
                 <p className="text-sm text-white/80 font-medium italic">
                   "We prioritize signal over noise, turning abstract intuition into technical reality."
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {coreCards.map((card, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-4 hover:border-accent/40 transition-all group">
                   <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                      <card.icon size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-black uppercase text-white mb-2">{card.title}</h4>
                      <p className="text-[10px] text-text-dim leading-relaxed">{card.desc}</p>
                   </div>
                   <button className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all pt-2">
                      Learn More <ChevronRight size={12} />
                   </button>
                </div>
              ))}
           </div>
        </section>

        {/* ROLE GUIDES */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">Role Guides</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">What should I do next?</h3>
            <p className="text-text-dim max-w-2xl mx-auto">Choose the guide that matches your role. Each guide explains the current state, available next action and what success looks like.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {guideSections.map((section) => (
              <article key={section.id} id={section.id} className="rounded-[32px] border border-white/5 bg-white/[0.02] p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-accent">{section.audience} guide</p>
                    <h4 className="mt-1 text-lg font-black uppercase tracking-tight text-white">{section.title}</h4>
                  </div>
                  <StatusBadge status="Published" label={section.statusLabel} />
                </div>
                <p className="text-sm leading-relaxed text-text-dim">{section.summary}</p>
                <ol className="space-y-2">
                  {section.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-xs leading-relaxed text-white/75">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-black text-accent">{index + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="rounded-2xl border border-accent/10 bg-accent/[0.04] p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-accent">Next action</p>
                  <p className="mt-1 text-xs text-white/80">{section.nextAction}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SCREENS AND STATES */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">Screens, Capabilities and States</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">Every screen explains itself</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(screenGuidance).map((screen) => (
              <div key={screen.title} className="rounded-[32px] border border-white/5 bg-[#0b0b0b] p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-black uppercase tracking-widest text-white">{screen.title}</h4>
                  <StatusBadge status="Latest Version" />
                </div>
                <p className="text-sm text-text-dim">{screen.purpose}</p>
                <div className="grid gap-3 text-xs text-white/70">
                  <p><span className="font-black uppercase tracking-widest text-white/35">State:</span> {screen.state}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">Next:</span> {screen.nextAction}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">Disabled:</span> {screen.disabledReason}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">Empty:</span> {screen.empty}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">Loading:</span> {screen.loading}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">Error:</span> {screen.error}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">Success:</span> {screen.success}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATUS GLOSSARY */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">Status Glossary</h2>
              <h3 className="mt-3 text-3xl md:text-5xl font-black uppercase tracking-tight">What each badge means</h3>
            </div>
            <StatusBadge status="Published Version" label="Glossary Complete" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statusGlossary.map(([label, meaning]) => (
              <div key={label} className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <StatusBadge status={label} label={label} />
                <p className="text-xs leading-relaxed text-text-dim">{meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-[48px] border border-white/5 bg-white/[0.02] p-8 md:p-12 space-y-8">
          <div>
            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">FAQ</h2>
            <h3 className="mt-3 text-3xl md:text-5xl font-black uppercase tracking-tight">No guessing required</h3>
          </div>
          {[
            ['Why is an action disabled?', 'The UI should show the reason near the button or in the screen guidance. Common causes are missing sign-in, incomplete profile, missing API key, protected founder/admin role or a ticket that is no longer Open.'],
            ['What if GitHub or OpenRouter is not connected?', 'The app labels the flow Not Configured, Connection Untested or Not connected yet instead of pretending the backend is complete. Configure settings and run diagnostics before relying on the integration.'],
            ['How do stars work?', 'Stars are awarded by founder/admin review after accepted work. They represent shipped, verified contribution rather than claimed work.'],
            ['What should demo users avoid?', 'Demo users should use only labeled demo data. Production Protected means real data and secrets are intentionally not touched.'],
            ['Where do I see version popup state?', 'The changelog and version popup use Latest Version, Not Yet Acknowledged and Acknowledged badges so builders know whether they have read the latest release.']
          ].map(([question, answer]) => (
            <div key={question} className="border-t border-white/5 pt-5">
              <h4 className="font-black uppercase tracking-widest text-white">{question}</h4>
              <p className="mt-2 text-sm leading-relaxed text-text-dim">{answer}</p>
            </div>
          ))}
        </section>

        {/* USER FLOWS */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">Process Library</h2>
             <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">Standard User Flows</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {flows.map((flow) => (
               <div key={flow.id} className="bg-[#111] border border-white/5 rounded-[40px] p-8 md:p-12 space-y-10 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-accent/10 transition-colors">
                     <Layers size={80} />
                  </div>
                  <div className="relative z-10 space-y-2">
                     <h4 className="text-2xl font-black text-white uppercase tracking-tight">{flow.title}</h4>
                     <p className="text-sm text-text-dim font-medium">{flow.description}</p>
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                     {flow.steps.map((step, i) => (
                       <div key={i} className="flex gap-6 items-start group/step">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-black text-white group-hover/step:bg-accent group-hover/step:border-accent transition-all">
                             {step.step}
                          </div>
                          <div className="space-y-1 pt-0.5">
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">{step.label}</span>
                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[10px] font-mono text-text-dim">{step.page}</span>
                             </div>
                             <p className="text-sm text-white/80 font-medium">{step.action}</p>
                             <p className="text-[10px] text-text-dim italic">Result: {step.expected_result}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* RECORDINGS LIBRARY */}
        {recordings.length > 0 && (
          <section className="space-y-12">
             <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase tracking-widest">Demo Recordings</h3>
                <div className="text-[10px] font-black text-text-dim uppercase tracking-widest">{recordings.length} Archvied</div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recordings.map((rec) => (
                  <div key={rec.id} className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden group">
                     <div className="aspect-video bg-black flex items-center justify-center text-white/10 group-hover:bg-accent/5 transition-all">
                        <Video size={40} />
                     </div>
                     <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-accent uppercase bg-accent/10 px-2 py-1 rounded">v{rec.version}</span>
                           <span className="text-[10px] font-mono text-text-dim flex items-center gap-1">
                              <Clock size={10} /> {Math.floor(rec.duration / 60)}:{(rec.duration % 60).toString().padStart(2, '0')}
                           </span>
                        </div>
                        <h4 className="text-xs font-black text-white uppercase truncate">{rec.filename}</h4>
                        <div className="flex justify-between items-center pt-2">
                           <span className="text-[10px] font-mono text-text-dim">{formatDistanceToNow(new Date(rec.created_at), { addSuffix: true })}</span>
                           <a href={rec.file_url} download className="text-accent hover:text-white transition-colors">
                              <Download size={14} />
                           </a>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* FINAL CTA */}
        <section className="text-center py-32 bg-accent/5 border border-accent/20 rounded-[80px] space-y-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.05)_0%,transparent_70%)] animate-pulse" />
          <div className="relative z-10 space-y-8 px-6">
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white text-balance">
              Don’t just watch the vision.<br />
              <span className="text-accent italic">Build it.</span>
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
               <button className="glass-btn-primary !px-12 !py-5 shadow-2xl">
                 Join as Builder
               </button>
               <button className="glass-btn-secondary !px-12 !py-5 border-white/10 hover:bg-white/5">
                 View Current Focus
               </button>
            </div>
          </div>
        </section>

      </div>

      <AnimatePresence>
        {isDemoRunning && (
          <AutoDemoRecorder onExit={() => setIsDemoRunning(false)} />
        )}
      </AnimatePresence>

    </div>
  );
}
