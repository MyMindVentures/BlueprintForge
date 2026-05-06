import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, Rocket, Play, Clock, ChevronRight, 
  Download, Video, Zap, Github, Terminal, 
  Layers, UserPlus, Target, Radio, Star, Info
} from 'lucide-react';
import { useGuide } from '../../hooks/useGuide';
import { AutoDemoRecorder } from './AutoDemoRecorder';
import { GUIDE_SECTION_KEYS, SCREEN_GUIDANCE_KEYS, TranslatedGuideSection, TranslatedScreenGuidance, TranslatedStatusGlossaryItem } from '../../content/guides/blueprintGuides';
import { StatusBadge } from '../ui/StatusBadge';
import { useI18n } from '../../i18n/I18nProvider';

/**
 * Presents the central self-explaining BlueprintForge guide, changelog and demo recorder.
 * Used by visitors, builders, founders and observers to understand screens, roles, statuses and next actions.
 */
export function GuidePage() {
  const { t, tData, formatRelativeTime, formatDate } = useI18n();
  const { latestVersion, flows, recordings, currentSession, startDemoSession } = useGuide();
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const guideSections = GUIDE_SECTION_KEYS.map((key) => tData<TranslatedGuideSection>(`guide.${key}`));
  const screenGuidance = SCREEN_GUIDANCE_KEYS.map((key) => tData<TranslatedScreenGuidance>(`guide.screens.${key}`));
  const statusGlossary = tData<TranslatedStatusGlossaryItem[]>('guide.statusGlossary.items');
  const faqs = tData<Array<{ question: string; answer: string }>>('guide.faq.items');

  const latestVersionNumber = latestVersion?.version || '0.0.0';
  const latestReleaseDate = latestVersion ? formatDate(latestVersion.created_at, { dateStyle: 'medium' }) : t('guide.latestVersion.notAvailable');

  const coreCards = [
    { icon: Layers, title: t("guide.founderVision"), desc: t("guide.founderVisionDesc"), page: "vision" },
    { icon: Zap, title: t("guide.bootstrapPage"), desc: t("guide.bootstrapPageDesc"), page: "bootstrap" },
    { icon: Radio, title: t("guide.liveBuildFeed"), desc: t("guide.liveBuildFeedDesc"), page: "feed_coder" },
    { icon: Target, title: t("guide.currentFocus"), desc: t("guide.currentFocusDesc"), page: "feed_coder" },
    { icon: UserPlus, title: t("guide.coderProfiles"), desc: t("guide.coderProfilesDesc"), page: "coder_profile" },
    { icon: Star, title: t("guide.reputation"), desc: t("guide.reputationDesc"), page: "coder_directory" }
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
              {t('guide.hero.eyebrow')}
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tight leading-[0.85]">
              {t('guide.hero.headline')}
            </h1>
            <p className="text-lg md:text-xl text-text-dim max-w-2xl mx-auto font-medium">
              {t('guide.hero.subtitle')}
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 pt-4">
             <button 
               onClick={() => setIsDemoRunning(true)}
               className="glass-btn-primary !px-10 !py-4 flex items-center gap-3 shadow-[0_0_40px_rgba(255,107,0,0.2)]"
              >
               <Play size={18} fill="currentColor" />
               {t('guide.hero.watchDemo')}
             </button>
             <button className="glass-btn-secondary !px-10 !py-4 border-white/5">
                {t('guide.hero.version', { version: latestVersionNumber })}
             </button>
             <button className="glass-btn-secondary !px-10 !py-4 border-white/5">
                {t('guide.hero.githubRepo')}
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
                <h2 className="text-xl font-black text-white uppercase tracking-widest">{t('guide.latestVersion.heading', { version: latestVersionNumber })}</h2>
              </div>
              <p className="text-3xl font-black text-white/90 uppercase tracking-tight">"{latestVersion?.release_title}"</p>
            </div>
            <div className="text-[10px] font-black text-text-dim uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
               {t('guide.latestVersion.released', { date: latestReleaseDate })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
             <div className="space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-accent uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} fill="currentColor" /> {t('guide.latestVersion.newFeatures')}
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
                      <h3 className="text-xs font-black text-text-dim uppercase tracking-widest flex items-center gap-2">{t('guide.latestVersion.fixedIssues')}</h3>
                      <ul className="space-y-2">
                        {latestVersion?.fixed_issues.map((f, i) => (
                          <li key={i} className="text-xs text-text-dim flex gap-3">
                            <span className="text-green-500/50">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-xs font-black text-text-dim uppercase tracking-widest flex items-center gap-2">{t('guide.latestVersion.knownLimitations')}</h3>
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
                   <h4 className="text-[10px] font-black text-text-dim uppercase tracking-widest">{t('guide.latestVersion.releaseNotes')}</h4>
                   <p className="text-xs text-white/60 leading-relaxed italic">
                     "{latestVersion?.release_notes}"
                   </p>
                </div>
                <button className="w-full glass-btn-secondary !text-[10px] !py-3 !font-black uppercase tracking-[0.2em] border-white/5 flex items-center justify-center gap-2">
                   <Github size={14} /> {t('guide.latestVersion.fullGithubChangelog')}
                </button>
             </div>
          </div>
        </section>

        {/* WHAT IS BLUEPRINTFORGE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">{t('guide.anatomy.eyebrow')}</h2>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{t('guide.anatomy.headlineTop')}<br />{t('guide.anatomy.headlineBottom')}</h3>
              </div>
              <p className="text-xl text-text-dim leading-relaxed font-medium">
                {t('guide.anatomy.description')}
              </p>
              <div className="flex items-center gap-4 p-6 bg-accent/5 border-l-4 border-accent rounded-r-3xl">
                 <Info size={24} className="text-accent shrink-0" />
                 <p className="text-sm text-white/80 font-medium italic">
                   "{t('guide.anatomy.quote')}"
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
                      {t('guide.core.learnMore')} <ChevronRight size={12} />
                   </button>
                </div>
              ))}
           </div>
        </section>

        {/* ROLE GUIDES */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">{t('guide.roleGuides.eyebrow')}</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{t('guide.roleGuides.headline')}</h3>
            <p className="text-text-dim max-w-2xl mx-auto">{t('guide.roleGuides.description')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {guideSections.map((section) => (
              <article key={section.id} id={section.id} className="rounded-[32px] border border-white/5 bg-white/[0.02] p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-accent">{t('guide.roleGuides.audienceLabel', { audience: section.audience })}</p>
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
                  <p className="text-[9px] font-black uppercase tracking-widest text-accent">{t('guide.roleGuides.nextAction')}</p>
                  <p className="mt-1 text-xs text-white/80">{section.nextAction}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SCREENS AND STATES */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">{t('guide.screens.eyebrow')}</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{t('guide.screens.headline')}</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {screenGuidance.map((screen) => (
              <div key={screen.title} className="rounded-[32px] border border-white/5 bg-[#0b0b0b] p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-black uppercase tracking-widest text-white">{screen.title}</h4>
                  <StatusBadge status="Latest Version" />
                </div>
                <p className="text-sm text-text-dim">{screen.purpose}</p>
                <div className="grid gap-3 text-xs text-white/70">
                  <p><span className="font-black uppercase tracking-widest text-white/35">{t('guide.screens.labels.state')}</span> {screen.state}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">{t('guide.screens.labels.next')}</span> {screen.nextAction}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">{t('guide.screens.labels.disabled')}</span> {screen.disabledReason}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">{t('guide.screens.labels.empty')}</span> {screen.empty}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">{t('guide.screens.labels.loading')}</span> {screen.loading}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">{t('guide.screens.labels.error')}</span> {screen.error}</p>
                  <p><span className="font-black uppercase tracking-widest text-white/35">{t('guide.screens.labels.success')}</span> {screen.success}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATUS GLOSSARY */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">{t('guide.statusGlossary.eyebrow')}</h2>
              <h3 className="mt-3 text-3xl md:text-5xl font-black uppercase tracking-tight">{t('guide.statusGlossary.headline')}</h3>
            </div>
            <StatusBadge status="Published Version" label={t('guide.statusGlossary.completeLabel')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statusGlossary.map(({ label, meaning }) => (
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
            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">{t('guide.faq.eyebrow')}</h2>
            <h3 className="mt-3 text-3xl md:text-5xl font-black uppercase tracking-tight">{t('guide.faq.headline')}</h3>
          </div>
          {faqs.map(({ question, answer }) => (
            <div key={question} className="border-t border-white/5 pt-5">
              <h4 className="font-black uppercase tracking-widest text-white">{question}</h4>
              <p className="mt-2 text-sm leading-relaxed text-text-dim">{answer}</p>
            </div>
          ))}
        </section>

        {/* USER FLOWS */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">{t('guide.flows.eyebrow')}</h2>
             <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{t('guide.flows.headline')}</h3>
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
                             <p className="text-[10px] text-text-dim italic">{t('guide.flows.result', { result: step.expected_result })}</p>
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
                <h3 className="text-2xl font-black uppercase tracking-widest">{t('guide.recordings.headline')}</h3>
                <div className="text-[10px] font-black text-text-dim uppercase tracking-widest">{t('guide.recordings.archived', { count: recordings.length })}</div>
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
                           <span className="text-[10px] font-mono text-text-dim">{formatRelativeTime(rec.created_at)}</span>
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
              {t('guide.cta.headlineTop')}<br />
              <span className="text-accent italic">{t('guide.cta.headlineEmphasis')}</span>
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
               <button className="glass-btn-primary !px-12 !py-5 shadow-2xl">
                 {t('guide.cta.joinBuilder')}
               </button>
               <button className="glass-btn-secondary !px-12 !py-5 border-white/10 hover:bg-white/5">
                 {t('guide.cta.viewCurrentFocus')}
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
