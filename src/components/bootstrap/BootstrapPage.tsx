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
        polished_title: t("bootstrap.fallbackTitle"),
        polished_context: rawInput,
        polished_change: t("bootstrap.fallbackChange"),
        ticket_problem: rawInput,
        acceptance_criteria: [t("bootstrap.fallbackAcceptance")],
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
          error(t("errors.githubIssueCreationFailed", { message: err.message }));
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
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-40">
        
        {/* HERO SECTION */}
        <section className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.3em]">
            <Zap size={14} fill="currentColor" className="animate-pulse" />
            {t("bootstrap.heroEyebrowFull")}
          </div>
          <div className="space-y-6 max-w-5xl">
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.85] uppercase">
              {t("bootstrap.heroTitlePrefix")}<br />
              <span className="text-accent underline decoration-white/10 underline-offset-[12px] italic">{t("bootstrap.heroTitleAccent")}</span><br />
              {t("bootstrap.heroTitleSuffix")}
            </h1>
            <p className="text-lg md:text-2xl text-text-dim max-w-3xl mx-auto leading-relaxed font-medium">
              {t("bootstrap.heroSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
             <button className="glass-btn-primary !px-12 !py-5 shadow-[0_0_60px_rgba(255,107,0,0.3)]">
               {t("buttons.joinAsBuilder")}
             </button>
             <button className="glass-btn-secondary !px-12 !py-5 border-white/5 hover:bg-white/5">
               {t("buttons.viewLiveBuildFeed")}
             </button>
             <button className="glass-btn-secondary !px-12 !py-5 border-white/5 hover:bg-white/5">
               {t("buttons.openGithubRepo")}
             </button>
          </div>
        </section>

        {/* ABOUT THE ARCHITECT */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
              {t("bootstrap.founderSectionEyebrow")}
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              {t("bootstrap.founderMind1")}<br />{t("bootstrap.founderMind2")}<br /><span className="text-accent">{t("bootstrap.founderMind3")}</span>
            </h2>
          </div>
          <div className="space-y-8 bg-white/[0.02] border border-white/5 rounded-[48px] p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <Quote size={48} className="text-accent/20 mb-4" />
            <div className="space-y-6 text-lg md:text-xl text-text-dim font-medium leading-relaxed italic">
              <p>{t("bootstrap.founderQuote1")}</p>
              <p>{t("bootstrap.founderQuote2")}</p>
              <p>{t("bootstrap.founderQuote3")}</p>
            </div>
            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
               <p className="font-mono text-sm tracking-[0.3em] uppercase text-white/20">{t("bootstrap.founderSignature")}</p>
               <div className="w-12 h-1 bg-accent" />
            </div>
          </div>
        </section>

        {/* WHAT IT IS SECTION */}
        <section className="py-24 border-y border-white/5 space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">{t("bootstrap.infrastructureEyebrow")}</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{t("bootstrap.whatIs")}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: t("bootstrap.cards.bootstrapPlatform.title"), d: t("bootstrap.cards.bootstrapPlatform.desc") },
              { t: t("bootstrap.cards.visionToSpec.title"), d: t("bootstrap.cards.visionToSpec.desc") },
              { t: t("bootstrap.cards.openEcosystem.title"), d: t("bootstrap.cards.openEcosystem.desc") },
              { t: t("bootstrap.cards.reputationLayer.title"), d: t("bootstrap.cards.reputationLayer.desc") },
              { t: t("bootstrap.cards.rapidBranching.title"), d: t("bootstrap.cards.rapidBranching.desc") },
              { t: t("bootstrap.cards.collectiveGrowth.title"), d: t("bootstrap.cards.collectiveGrowth.desc") }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-colors group">
                <h4 className="text-lg font-black uppercase text-white mb-3 group-hover:text-accent transition-colors">{item.t}</h4>
                <p className="text-sm text-text-dim leading-relaxed font-medium">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* THE BOOTSTRAP LOOP */}
        <section className="space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="space-y-4">
               <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">{t("bootstrap.workflowEyebrow")}</h2>
               <h3 className="text-4xl font-black uppercase tracking-tight">{t("bootstrap.loopTitle")}</h3>
             </div>
             <p className="text-text-dim max-w-sm text-sm font-medium">{t("bootstrap.loopDescription")}</p>
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
                    <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">{step.title}</h4>
                    <p className="text-[10px] text-text-dim leading-relaxed font-medium max-w-[140px]">{step.desc}</p>
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
              <h2 className="text-5xl font-black uppercase tracking-tighter">{t("bootstrap.ticketConverterTitle")}</h2>
              <p className="text-text-dim text-lg font-medium italic">{t("bootstrap.ticketConverterQuote")}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-12">
              <div className="space-y-8">
                <div className="relative">
                  <textarea
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder={t("bootstrap.ticketPlaceholder")}
                    className="w-full h-64 bg-black/60 border border-white/10 rounded-[40px] p-10 text-xl text-white placeholder:text-white/10 focus:outline-none focus:border-accent/40 transition-all resize-none shadow-inner"
                  />
                  <div className="absolute bottom-10 right-10">
                    <button
                      onClick={handlePolish}
                      disabled={isPolishing || !rawInput.trim()}
                      className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all shadow-2xl disabled:opacity-50"
                    >
                      {isPolishing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      {t("buttons.convertToTicket")}
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
                      <div className="p-8 border-b border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                           <h4 className="text-lg font-black uppercase tracking-tight text-white">{t("bootstrap.draftSpecPreview")}</h4>
                         </div>
                         <div className="flex gap-2">
                            <StatusBadge status={polishedResult.status || 'Open'} />
                            <span className="px-3 py-1 rounded-md bg-white/5 text-[10px] font-black text-text-dim uppercase">{polishedResult.type}</span>
                         </div>
                      </div>
                      
                      <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-6">
                            <div>
                               <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">{t("bootstrap.fieldTitle")}</p>
                               <p className="text-2xl font-black text-white leading-tight">{polishedResult.polished_title}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">{t("bootstrap.problemContext")}</p>
                               <p className="text-sm text-text-dim leading-relaxed">{polishedResult.polished_context}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">{t("bootstrap.expectedBehavior")}</p>
                               <p className="text-sm text-white font-bold leading-relaxed">{polishedResult.polished_change}</p>
                            </div>
                         </div>
                         <div className="space-y-6">
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                               <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">{t("bootstrap.acceptanceCriteria")}</p>
                               <ul className="space-y-3">
                                 {polishedResult.acceptance_criteria?.map((c, i) => (
                                   <li key={i} className="flex gap-3 text-xs text-white/70">
                                     <Hash size={12} className="text-accent shrink-0 mt-0.5" />
                                     {c}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                            <div className="flex gap-4">
                               <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-1">{t("bootstrap.priority")}</p>
                                 <p className="text-xs font-black text-white">{polishedResult.priority}</p>
                               </div>
                               <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-1">{t("bootstrap.difficulty")}</p>
                                 <p className="text-xs font-black text-white">{polishedResult.difficulty}</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="p-8 bg-accent/10 border-t border-accent/20 flex justify-end gap-4">
                         <button onClick={() => setPolishedResult(null)} className="px-8 py-3 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/5">{t("buttons.cancel")}</button>
                         <button 
                           onClick={handlePublish}
                           disabled={isPublishing}
                           className="flex items-center gap-3 bg-accent text-white px-12 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 shadow-xl shadow-accent/20"
                         >
                           {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                           {t("buttons.publishTicket")}
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
                       <h5 className="font-bold uppercase tracking-widest text-sm text-white">{t("bootstrap.whenYouPublish")}</h5>
                       <ul className="space-y-4">
                         {[
                           { icon: MessageSquare, t: t("bootstrap.publishEffects.signal.title"), d: t("bootstrap.publishEffects.signal.desc") },
                           { icon: Github, t: t("bootstrap.publishEffects.github.title"), d: t("bootstrap.publishEffects.github.desc") },
                           { icon: Users, t: t("bootstrap.publishEffects.builder.title"), d: t("bootstrap.publishEffects.builder.desc") }
                         ].map((item, i) => (
                           <li key={i} className="flex gap-4">
                             <item.icon size={16} className="text-white/20 shrink-0 mt-1" />
                             <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-white">{item.t}</p>
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
            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">{t("bootstrap.engineEyebrow")}</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{t("bootstrap.buildersTitle")}</h3>
            <p className="text-lg text-text-dim max-w-2xl mx-auto font-medium">
              {t("bootstrap.buildersQuote")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { i: UserPlus, t: t("bootstrap.builderSteps.createProfile.title"), d: t("bootstrap.builderSteps.createProfile.desc") },
              { i: Target, t: t("bootstrap.builderSteps.pickTicket.title"), d: t("bootstrap.builderSteps.pickTicket.desc") },
              { i: Github, t: t("bootstrap.builderSteps.openIssue.title"), d: t("bootstrap.builderSteps.openIssue.desc") },
              { i: Rocket, t: t("bootstrap.builderSteps.claimFork.title"), d: t("bootstrap.builderSteps.claimFork.desc") },
              { i: Code2, t: t("bootstrap.builderSteps.branchCode.title"), d: t("bootstrap.builderSteps.branchCode.desc") },
              { i: Sparkles, t: t("bootstrap.builderSteps.implement.title"), d: t("bootstrap.builderSteps.implement.desc") },
              { i: Send, t: t("bootstrap.builderSteps.submitPr.title"), d: t("bootstrap.builderSteps.submitPr.desc") },
              { i: Star, t: t("bootstrap.builderSteps.earnStars.title"), d: t("bootstrap.builderSteps.earnStars.desc") }
            ].map((step, idx) => (
              <div key={idx} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-accent/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                  <step.i size={20} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">{step.t}</h4>
                <p className="text-[10px] text-text-dim leading-relaxed font-medium">{step.d}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6">
            <button className="glass-btn-primary !px-8 !py-4">{t("buttons.createBuilderProfile")}</button>
            <button className="glass-btn-secondary !px-8 !py-4">{t("buttons.claimTicket")}</button>
          </div>
        </section>

        {/* GOALS SECTION */}
        <section className="space-y-16">
          <div className="text-center">
            <h3 className="text-4xl font-black uppercase tracking-tight">{t("bootstrap.goalsTitle")}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              t("bootstrap.goals.attractCoders"),
              t("bootstrap.goals.thoughtsToTickets"),
              t("bootstrap.goals.visibleImprovements"),
              t("bootstrap.goals.openSourceGrowth"),
              t("bootstrap.goals.reputationSystem"),
              t("bootstrap.goals.showcaseConcepts"),
              t("bootstrap.goals.transparency"),
              t("bootstrap.goals.shippedProducts")
            ].map((goal, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-black uppercase tracking-tight text-white">{goal}</span>
              </div>
            ))}
          </div>
        </section>

        {/* OPEN SOURCE RULES */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 py-24 border-t border-white/5">
          <div className="space-y-8">
            <h3 className="text-4xl font-black uppercase tracking-tight">{t("bootstrap.contributionsTitle")}</h3>
            <p className="text-text-dim font-medium leading-relaxed max-w-md italic">
              {t("bootstrap.contributionsQuote")}
            </p>
          </div>
          <div className="space-y-4">
            {[
              t("bootstrap.rules.claimedInApp"),
              t("bootstrap.rules.githubIssue"),
              t("bootstrap.rules.forkRepo"),
              t("bootstrap.rules.ownBranch"),
              t("bootstrap.rules.mentionTicket"),
              t("bootstrap.rules.adminReview"),
              t("bootstrap.rules.awardStar")
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
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-[10px] font-black uppercase tracking-[0.4em]">
            {t("bootstrap.fellowshipEyebrow")}
          </div>
          <div className="max-w-4xl mx-auto space-y-10">
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">{t("bootstrap.needsBuildersTitle")}</h3>
            <p className="text-xl md:text-3xl text-text-dim italic font-medium leading-relaxed">
              {t("bootstrap.needsBuildersQuote")}
            </p>
            <div className="pt-8 space-y-4">
               <p className="text-accent text-3xl font-black uppercase tracking-tighter">{t("bootstrap.togetherMore")}</p>
               <p className="text-white text-3xl font-black uppercase tracking-tighter">{t("bootstrap.bootstrapMovement")}</p>
            </div>
          </div>
        </section>

        {/* LIVE TICKETS PREVIEW */}
        <section className="space-y-12">
          <div className="flex items-center justify-between border-b border-white/5 pb-8">
            <h3 className="text-2xl font-black uppercase tracking-widest">{t("bootstrap.activeTicketsBlast")}</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2 hover:underline">
              {t("buttons.viewAllTickets")} <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {requests.slice(0, 3).map((req, i) => (
              <div key={i} className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6 hover:border-accent/40 transition-colors group">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                       <StatusBadge status={req.status} />
                       <span className="text-[10px] font-mono text-text-dim">{req.difficulty}</span>
                    </div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-accent transition-colors truncate">{req.polished_title}</h4>
                    <p className="text-[10px] text-text-dim font-medium line-clamp-3 leading-relaxed">{req.polished_context}</p>
                 </div>
                 <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {req.claimed_by ? (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-400">
                          <CheckCircle2 size={14} /> {t("statuses.claimed")}
                        </div>
                      ) : (
                        <button 
                          onClick={() => claimRequest(req.id)}
                          className="px-4 py-2 bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase rounded-lg hover:bg-accent hover:text-white transition-all shadow-xl shadow-accent/10"
                        >
                          {t("buttons.claim")}
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
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white text-balance">
              Don’t just watch the vision.<br />
              <span className="text-accent italic">{t("bootstrap.buildIt")}</span>
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
               <button className="glass-btn-primary !px-12 !py-5 shadow-2xl !bg-white !text-black hover:!bg-accent hover:!text-white border-none">
                 {t("buttons.joinAsBuilder")}
               </button>
               <button className="glass-btn-secondary !px-12 !py-5 border-white/10 hover:bg-white/5">
                 View Current Focus
               </button>
               <button className="glass-btn-secondary !px-12 !py-5 border-white/10 hover:bg-white/5">
                 {t("buttons.openGithubRepo")}
               </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
