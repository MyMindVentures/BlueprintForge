import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Zap, Cpu, Target, Users, Github, ArrowRight, Star, 
  Sparkles, CheckCircle2, MessageSquare, Code2, Rocket, 
  AlertCircle, ChevronRight, Hash, Quote, Radio, Clock, Loader2, UserPlus, Send
} from 'lucide-react';
import { useBuildFeed } from '../../hooks/useBuildFeed';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useGithubSettings } from '../../hooks/useGithubSettings';
import { createGithubIssue } from '../../services/githubClient';
import { AIService } from '../../services/aiService';
import { useToast } from '../ui/Toast';
import { StatusBadge } from '../ui/StatusBadge';
import { BuildRequest, BuildPriority, BuildDifficulty, BuildType } from '../../types/buildFeed';
import { isFounderAdminRole } from '../../authRoles';
import { useI18n } from '../../i18n/I18nProvider';

/**
 * Handles the bootstrap page workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function BootstrapPage() {
  const { t } = useI18n();
  const { 
    requests, publishRequest, updateRequest, currentUser, 
    claimRequest, profiles 
  } = useBuildFeed();
  const { llmSettings } = useWorkspace();
  const { settings: githubSettings } = useGithubSettings();
  const { success, error } = useToast();

  const [rawInput, setRawInput] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedResult, setPolishedResult] = useState<Partial<BuildRequest> | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const isAdmin = isFounderAdminRole(currentUser?.role);

  const handlePolish = async () => {
    if (!rawInput.trim()) return;
    
    if (!llmSettings.openRouterApiKey) {
      error(t("errors.missingOpenRouterKey"));
      return;
    }
    
    setIsPolishing(true);
    
    const aiService = new AIService(llmSettings.openRouterApiKey, llmSettings.defaultModelId);

    try {
      const parsed = await aiService.polishTicket(rawInput);
      setPolishedResult({
        raw_input: rawInput,
        polished_title: parsed.title,
        polished_context: parsed.problem,
        polished_change: parsed.goal,
        polished_ui_ux: parsed.ui_ux_requirements,
        ticket_problem: parsed.problem,
        ticket_goal: parsed.goal,
        ticket_expected_behavior: parsed.expected_behavior,
        ticket_ui_ux_requirements: parsed.ui_ux_requirements,
        ticket_technical_notes: parsed.technical_notes,
        acceptance_criteria: parsed.acceptance_criteria || [],
        priority: parsed.priority || "Medium",
        difficulty: parsed.difficulty || "Medium",
        type: parsed.type || "App Improvement"
      });
      success(t("success.ticketPolished"));
    } catch (e: any) {
      error(e.message);
      setPolishedResult({
        raw_input: rawInput,
        polished_title: "New Build Request",
        polished_context: rawInput,
        polished_change: "Please refine the implementation based on the context.",
        ticket_problem: rawInput,
        acceptance_criteria: ["Implemented successfully"],
        priority: "Medium",
        difficulty: "Medium",
        type: "App Improvement"
      });
    } finally {
      setIsPolishing(false);
    }
  };

  const handlePublish = async () => {
    if (!polishedResult) return;
    setIsPublishing(true);
    try {
      const newRequestId = await publishRequest(polishedResult as any);
      setPolishedResult(null);
      setRawInput('');
      
      if (githubSettings.auto_create_issues && githubSettings.github_token) {
        try {
          // We need the full object for GitHub creation, fetch it or reconstruct it
          const newRequest = { id: newRequestId, ...polishedResult } as BuildRequest;
          const ghResponse = await createGithubIssue(newRequest, githubSettings);
          await updateRequest(newRequest.id, {
            github_issue_url: ghResponse.url,
            github_issue_number: ghResponse.number,
            github_repo_url: githubSettings.repo_url,
            github_sync_status: 'success',
            github_created_at: new Date().toISOString()
          });
        } catch (err: any) {
          await updateRequest(newRequestId, { github_sync_status: 'failed' });
          error(`Feed published, but GitHub issue creation failed: ${err.message}`);
        }
      }
      
      success(t("success.ticketPublished"));
    } catch (e: any) {
      error(e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const loopSteps = [
    { icon: Quote, title: t("bootstrap.founderThought"), desc: t("bootstrap.founderThoughtDesc") },
    { icon: Sparkles, title: t("bootstrap.aiDistillation"), desc: t("bootstrap.aiDistillationDesc") },
    { icon: Radio, title: t("bootstrap.feedBroadcast"), desc: t("bootstrap.feedBroadcastDesc") },
    { icon: Github, title: t("bootstrap.githubSync"), desc: t("bootstrap.githubSyncDesc") },
    { icon: Users, title: t("bootstrap.builderClaim"), desc: t("bootstrap.builderClaimDesc") },
    { icon: Code2, title: t("bootstrap.implementation"), desc: t("bootstrap.implementationDesc") },
    { icon: Rocket, title: t("bootstrap.launchImprove"), desc: t("bootstrap.launchImproveDesc") }
  ];

  return (
    <div className="flex-1 overflow-auto bg-[#050505] text-white scrollbar-thin selection:bg-accent/30 selection:text-white">
      <div className="mx-auto max-w-7xl space-y-28 px-4 py-12 sm:px-6 md:space-y-40 md:py-24">
        
        {/* HERO SECTION */}
        <section className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-[10px] font-black leading-snug text-accent">
            <Zap size={14} fill="currentColor" className="animate-pulse" />
            Venture Studio Movement
          </div>
          <div className="space-y-6 max-w-5xl">
            <h1 className="break-words text-5xl font-black leading-[0.9] tracking-tight md:text-8xl">
              BlueprintForge AI:<br />
              <span className="text-accent underline decoration-white/10 underline-offset-[12px] italic">Where Vision</span><br />
              Becomes Buildable Reality
            </h1>
            <p className="text-lg md:text-2xl text-text-dim max-w-3xl mx-auto leading-relaxed font-medium">
              I’m The Architect. I bring raw vision, app concepts and direction. Builders bring execution. Together we turn ideas into real products.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-stretch justify-center gap-4 pt-4 sm:gap-6">
             <button className="glass-btn-primary min-w-0 flex-1 basis-56 justify-center !px-6 !py-5 text-center whitespace-normal break-words shadow-[0_0_60px_rgba(255,107,0,0.3)] sm:flex-none sm:!px-10">
               Join as Builder
             </button>
             <button className="glass-btn-secondary min-w-0 flex-1 basis-56 justify-center border-white/5 !px-6 !py-5 text-center whitespace-normal break-words hover:bg-white/5 sm:flex-none sm:!px-10">
               View Live Build Feed
             </button>
             <button className="glass-btn-secondary min-w-0 flex-1 basis-56 justify-center border-white/5 !px-6 !py-5 text-center whitespace-normal break-words hover:bg-white/5 sm:flex-none sm:!px-10">
               Open GitHub Repo
             </button>
          </div>
        </section>

        {/* ABOUT THE ARCHITECT */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black leading-snug text-white/40">
              Section 01 / The Founder
            </div>
            <h2 className="break-words text-4xl font-black leading-none tracking-tighter md:text-6xl">
              The Mind<br />Behind the<br /><span className="text-accent">Architect</span>
            </h2>
          </div>
          <div className="space-y-8 bg-white/[0.02] border border-white/5 rounded-[48px] p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <Quote size={48} className="text-accent/20 mb-4" />
            <div className="space-y-6 text-lg md:text-xl text-text-dim font-medium leading-relaxed italic">
              <p>“I’m a visionary app thinker with ADHD. My brain constantly generates product ideas, platform concepts, improvements and future-facing systems.”</p>
              <p>“For months I fought inside AI build tools because I could see what needed to exist, but I could not always build it alone.”</p>
              <p>“BlueprintForge AI is my answer: a system where my thoughts no longer disappear, but become structured tickets that builders can pick up, implement and improve.”</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-8">
               <p className="min-w-0 break-words font-mono text-sm text-white/20">— Kevin De Vlieger</p>
               <div className="w-12 h-1 bg-accent" />
            </div>
          </div>
        </section>

        {/* WHAT IT IS SECTION */}
        <section className="py-24 border-y border-white/5 space-y-20">
          <div className="text-center space-y-6">
            <h2 className="break-words text-[10px] font-black leading-snug text-accent">{t("bootstrap.infrastructureEyebrow")}</h2>
            <h3 className="break-words text-4xl font-black tracking-tight md:text-6xl">{t("bootstrap.whatIs")}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: "Bootstrap Platform", d: "A system designed to rapidly prototype and evolve through collective decentralized intelligence." },
              { t: "Vision to Spec", d: "Converts raw founder intuition into structured technical requirements without losing intent." },
              { t: "Open Ecosystem", d: "Every ticket is a mirrored GitHub issue, allowing builders to work in a native coding environment." },
              { t: "Reputation Layer", d: "Builders earn stars and status by shipping verified improvements to the core platform." },
              { t: "Rapid Branching", d: "Fork, branch, build, and PR. The standard git workflow applied to high-speed innovation." },
              { t: "Collective Growth", d: "Accepted code doesn't just sit in a repo—it immediately improves the workspace you build in." }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-colors group">
                <h4 className="mb-3 break-words text-lg font-black text-white transition-colors group-hover:text-accent">{item.t}</h4>
                <p className="text-sm text-text-dim leading-relaxed font-medium">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* THE BOOTSTRAP LOOP */}
        <section className="space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="space-y-4">
               <h2 className="break-words text-[10px] font-black leading-snug text-accent">{t("bootstrap.workflowEyebrow")}</h2>
               <h3 className="break-words text-4xl font-black tracking-tight">The Bootstrap Loop</h3>
             </div>
             <p className="text-text-dim max-w-sm text-sm font-medium">How we turn abstract vision into production-ready features in 7 steps.</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 hidden lg:block" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-8">
              {loopSteps.map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-6 group">
                  <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-500 shadow-xl">
                    <step.icon size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-accent/40 mb-1 block">{i + 1}</span>
                    <h4 className="mb-2 break-words text-xs font-black leading-snug text-white">{step.title}</h4>
                    <p className="max-w-full break-words text-[10px] font-medium leading-relaxed text-text-dim">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOUNDER INPUT → TICKET CONVERTER */}
        {isAdmin && (
          <section className="p-12 md:p-24 bg-accent/5 border border-accent/20 rounded-[64px] space-y-16">
            <div className="text-center space-y-4">
              <h2 className="break-words text-4xl font-black tracking-tighter sm:text-5xl">Turn my thought into a build ticket</h2>
              <p className="text-text-dim text-lg font-medium italic">"Watch the AI turn raw founder energy into actionable truth."</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-12">
              <div className="space-y-8">
                <div className="relative">
                  <textarea
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="Write what you want BlueprintForge AI to improve, build, fix or explore…"
                    className="w-full h-64 bg-black/60 border border-white/10 rounded-[40px] p-10 text-xl text-white placeholder:text-white/10 focus:outline-none focus:border-accent/40 transition-all resize-none shadow-inner"
                  />
                  <div className="absolute bottom-10 right-10">
                    <button
                      onClick={handlePolish}
                      disabled={isPolishing || !rawInput.trim()}
                      className="flex min-w-0 items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-center text-xs font-black leading-snug text-black shadow-2xl transition-all hover:bg-accent hover:text-white disabled:opacity-50 whitespace-normal break-words sm:px-8"
                    >
                      {isPolishing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      Convert to Ticket
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {polishedResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-black border border-accent/40 rounded-[48px] overflow-hidden shadow-2xl"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 p-6 sm:p-8">
                         <div className="flex min-w-0 items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                           <h4 className="min-w-0 break-words text-lg font-black tracking-tight text-white">Draft Specification Preview</h4>
                         </div>
                         <div className="flex min-w-0 flex-wrap gap-2">
                            <StatusBadge status={polishedResult.status || 'Open'} />
                            <span className="min-w-0 break-words rounded-md bg-white/5 px-3 py-1 text-[10px] font-black leading-snug text-text-dim">{polishedResult.type}</span>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-8 p-6 sm:p-10 md:grid-cols-2 md:gap-12">
                         <div className="space-y-6">
                            <div>
                               <p className="mb-2 break-words text-[10px] font-black leading-snug text-accent">Title</p>
                               <p className="break-words text-2xl font-black leading-tight text-white">{polishedResult.polished_title}</p>
                            </div>
                            <div>
                               <p className="mb-2 break-words text-[10px] font-black leading-snug text-accent">Problem / Context</p>
                               <p className="break-words text-sm leading-relaxed text-text-dim">{polishedResult.polished_context}</p>
                            </div>
                            <div>
                               <p className="mb-2 break-words text-[10px] font-black leading-snug text-accent">Expected Behavior</p>
                               <p className="break-words text-sm font-bold leading-relaxed text-white">{polishedResult.polished_change}</p>
                            </div>
                         </div>
                         <div className="space-y-6">
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                               <p className="break-words text-[10px] font-black leading-snug text-text-dim">Acceptance Criteria</p>
                               <ul className="space-y-3">
                                 {polishedResult.acceptance_criteria?.map((c, i) => (
                                   <li key={i} className="flex min-w-0 gap-3 text-xs text-white/70">
                                     <Hash size={12} className="text-accent shrink-0 mt-0.5" />
                                     {c}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                            <div className="flex min-w-0 flex-wrap gap-4">
                               <div className="min-w-0 flex-1 basis-32 rounded-2xl border border-white/5 bg-white/5 p-4">
                                 <p className="mb-1 break-words text-[10px] font-black leading-snug text-text-dim">Priority</p>
                                 <p className="text-xs font-black text-white">{polishedResult.priority}</p>
                               </div>
                               <div className="min-w-0 flex-1 basis-32 rounded-2xl border border-white/5 bg-white/5 p-4">
                                 <p className="mb-1 break-words text-[10px] font-black leading-snug text-text-dim">Difficulty</p>
                                 <p className="text-xs font-black text-white">{polishedResult.difficulty}</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-3 border-t border-accent/20 bg-accent/10 p-6 sm:p-8">
                         <button onClick={() => setPolishedResult(null)} className="min-w-0 rounded-xl px-6 py-3 text-[10px] font-black leading-snug text-white hover:bg-white/5 whitespace-normal break-words sm:px-8">Cancel</button>
                         <button 
                           onClick={handlePublish}
                           disabled={isPublishing}
                           className="flex min-w-0 items-center justify-center gap-3 rounded-xl bg-accent px-6 py-3 text-center text-[10px] font-black leading-snug text-white shadow-xl shadow-accent/20 hover:bg-accent/90 whitespace-normal break-words sm:px-10"
                         >
                           {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                           Publish Ticket
                         </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <aside className="space-y-8">
                 <div className="p-8 bg-black/40 border border-white/5 rounded-[40px] space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                      <Zap size={24} fill="currentColor" />
                    </div>
                    <div className="space-y-2">
                       <h5 className="break-words text-sm font-bold leading-snug text-white">When you publish:</h5>
                       <ul className="space-y-4">
                         {[
                           { icon: MessageSquare, t: "Signal Broadcasted", d: "Ticket appears in the Live Build Feed instantly." },
                           { icon: Github, t: "GitHub Mirror", d: "Issue created in repo if configured." },
                           { icon: Users, t: "Builder Alert", d: "Coders can now claim, fork, and build." }
                         ].map((item, i) => (
                           <li key={i} className="flex min-w-0 flex-wrap gap-4">
                             <item.icon size={16} className="text-white/20 shrink-0 mt-1" />
                             <div>
                               <p className="break-words text-[10px] font-black leading-snug text-white">{item.t}</p>
                               <p className="text-[10px] text-text-dim font-medium">{item.d}</p>
                             </div>
                           </li>
                         ))}
                       </ul>
                    </div>
                 </div>
              </aside>
            </div>
          </section>
        )}

        {/* FOR BUILDERS SECTION */}
        <section className="space-y-20">
          <div className="text-center space-y-6">
            <h2 className="break-words text-[10px] font-black leading-snug text-accent">The Engine</h2>
            <h3 className="break-words text-4xl font-black tracking-tight md:text-6xl">Builders: This is where you come in</h3>
            <p className="text-lg text-text-dim max-w-2xl mx-auto font-medium">
              “You don’t need to guess what to build. Open a ticket, accept it, fork the repo, create your branch and start shipping.”
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { i: UserPlus, t: "Create Profile", d: "Set up your Vibe Coder identity." },
              { i: Target, t: "Pick a Ticket", d: "Choose from the Live Build Feed." },
              { i: Github, t: "Open Issue", d: "See tech specs on GitHub." },
              { i: Rocket, t: "Claim & Fork", d: "Take ownership and fork the repo." },
              { i: Code2, t: "Branch & Code", d: "Work on your dedicated branch." },
              { i: Sparkles, t: "Implement", d: "Build the requested feature." },
              { i: Send, t: "Submit PR", d: "Send your pull request for review." },
              { i: Star, t: "Earn Stars", d: "Get reputation when merged." }
            ].map((step, idx) => (
              <div key={idx} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-accent/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                  <step.i size={20} />
                </div>
                <h4 className="mb-2 break-words text-xs font-black leading-snug text-white">{step.t}</h4>
                <p className="text-[10px] text-text-dim leading-relaxed font-medium">{step.d}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <button className="glass-btn-primary min-w-0 flex-1 basis-56 justify-center !px-6 !py-4 text-center whitespace-normal break-words sm:flex-none sm:!px-8">Create Builder Profile</button>
            <button className="glass-btn-secondary min-w-0 flex-1 basis-56 justify-center !px-6 !py-4 text-center whitespace-normal break-words sm:flex-none sm:!px-8">Claim a Ticket</button>
          </div>
        </section>

        {/* GOALS SECTION */}
        <section className="space-y-16">
          <div className="text-center">
            <h3 className="break-words text-4xl font-black tracking-tight">The Bootstrap Goals</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Attract the first 100 vibe coders",
              "Turn founder thoughts into tickets",
              "Make every improvement visible",
              "Grow through open-source",
              "Build a reputation system",
              "Showcase app concepts",
              "Platform evolution transparency",
              "Turn vision into shipped products"
            ].map((goal, i) => (
              <div key={i} className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="min-w-0 break-words text-xs font-black leading-snug text-white">{goal}</span>
              </div>
            ))}
          </div>
        </section>

        {/* OPEN SOURCE RULES */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 py-24 border-t border-white/5">
          <div className="space-y-8">
            <h3 className="break-words text-4xl font-black tracking-tight">How Contributions Work</h3>
            <p className="text-text-dim font-medium leading-relaxed max-w-md italic">
              "We follow a strict decentralized high-speed protocol to ensure quality and visibility."
            </p>
          </div>
          <div className="space-y-4">
            {[
              "Every ticket must be claimed inside the app.",
              "Every ticket links to a GitHub issue.",
              "Builders fork the repo before implementation.",
              "Builders work on their own branch.",
              "Pull requests must mention the ticket/issue number.",
              "Admin reviews and accepts completed work.",
              "Accepted implementation gives the builder +1 star."
            ].map((rule, i) => (
              <div key={i} className="flex gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
                <CheckCircle2 size={16} className="text-accent mt-1 shrink-0" />
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{rule}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="text-center py-32 space-y-12">
          <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-accent/40 bg-accent/20 px-4 py-1.5 text-[10px] font-black leading-snug text-accent">
            The Fellowship
          </div>
          <div className="max-w-4xl mx-auto space-y-10">
            <h3 className="break-words text-5xl font-black leading-none tracking-tighter md:text-7xl">The Architect Needs Builders</h3>
            <p className="text-xl md:text-3xl text-text-dim italic font-medium leading-relaxed">
              “The pain is simple: vision without execution stays trapped. BlueprintForge AI exists to connect The Architect and The Builders.”
            </p>
            <div className="pt-8 space-y-4">
               <p className="break-words text-3xl font-black tracking-tighter text-accent">Together this becomes more than an app.</p>
               <p className="break-words text-3xl font-black tracking-tighter text-white">It becomes a bootstrap movement.</p>
            </div>
          </div>
        </section>

        {/* LIVE TICKETS PREVIEW */}
        <section className="space-y-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-8">
            <h3 className="break-words text-2xl font-black leading-tight">Active Tickets Blast</h3>
            <button className="flex min-w-0 items-center gap-2 break-words text-[10px] font-black leading-snug text-accent hover:underline">
              View all tickets <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {requests.slice(0, 3).map((req, i) => (
              <div key={i} className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6 hover:border-accent/40 transition-colors group">
                 <div className="space-y-4">
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
                       <StatusBadge status={req.status} />
                       <span className="text-[10px] font-mono text-text-dim">{req.difficulty}</span>
                    </div>
                    <h4 className="break-words text-lg font-black tracking-tight text-white transition-colors group-hover:text-accent">{req.polished_title}</h4>
                    <p className="text-[10px] text-text-dim font-medium line-clamp-3 leading-relaxed">{req.polished_context}</p>
                 </div>
                 <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {req.claimed_by ? (
                        <div className="flex min-w-0 items-center gap-2 break-words text-[10px] font-black text-green-400">
                          <CheckCircle2 size={14} /> Claimed
                        </div>
                      ) : (
                        <button 
                          onClick={() => claimRequest(req.id)}
                          className="min-w-0 rounded-lg border border-accent/20 bg-accent/10 px-4 py-2 text-center text-[10px] font-black leading-snug text-accent shadow-xl shadow-accent/10 transition-all hover:bg-accent hover:text-white whitespace-normal break-words"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                    {req.github_issue_url && (
                      <a href={req.github_issue_url} target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-colors">
                        <Github size={18} />
                      </a>
                    )}
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="text-center py-32 bg-accent/5 rounded-[80px] border border-accent/20 space-y-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.05)_0%,transparent_70%)] animate-pulse" />
          <div className="relative z-10 space-y-8 px-6">
            <h3 className="break-words text-4xl font-black tracking-tight text-white text-balance md:text-6xl">
              Don’t just watch the vision.<br />
              <span className="text-accent italic">Build it.</span>
            </h3>
            <div className="flex w-full flex-wrap items-stretch justify-center gap-4 pt-6 sm:gap-6">
               <button className="glass-btn-primary min-w-0 flex-1 basis-56 justify-center border-none !bg-white !px-6 !py-5 text-center !text-black shadow-2xl whitespace-normal break-words hover:!bg-accent hover:!text-white sm:flex-none sm:!px-10">
                 Join as Builder
               </button>
               <button className="glass-btn-secondary min-w-0 flex-1 basis-56 justify-center border-white/10 !px-6 !py-5 text-center whitespace-normal break-words hover:bg-white/5 sm:flex-none sm:!px-10">
                 View Current Focus
               </button>
               <button className="glass-btn-secondary min-w-0 flex-1 basis-56 justify-center border-white/10 !px-6 !py-5 text-center whitespace-normal break-words hover:bg-white/5 sm:flex-none sm:!px-10">
                 Open GitHub Repo
               </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
