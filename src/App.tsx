import React, { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { ProjectDashboard } from "./components/projects/ProjectDashboard";
import { ProjectWorkspace } from "./components/projects/ProjectWorkspace";
import { AgentList } from "./components/agents/AgentList";
import { AgentEditor } from "./components/agents/AgentEditor";
import { LLMSettingsPage } from "./components/models/LLMSettingsPage";
import { OpenRouterDiagnosticsPage } from "./components/models/OpenRouterDiagnosticsPage";
import { LiveBuildFeedAdmin } from "./components/buildFeed/LiveBuildFeedAdmin";
import { LiveBuildFeed } from "./components/buildFeed/LiveBuildFeed";
import { BuilderProfile } from "./components/buildFeed/BuilderProfile";
import { VibeCoderDirectory } from "./components/buildFeed/VibeCoderDirectory";
import { FounderVisionPage } from "./components/vision/FounderVisionPage";
import { LandingPage } from "./components/layout/LandingPage";
import { BootstrapPage } from "./components/bootstrap/BootstrapPage";
import { GuidePage } from "./components/guide/GuidePage";
import { ErrorPage } from "./components/layout/ErrorPage";
import { useWorkspace } from "./hooks/useWorkspace";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./components/ui/Toast";
import { I18nProvider, useI18n } from "./i18n/I18nProvider";
import { HelpBlock } from "./components/help/HelpBlock";
import { LoadingState } from "./components/state/LoadingState";
import { TranslatedScreenGuidance } from "./content/guides/blueprintGuides";
import { describeMissingAdminAccess, isFounderAdminRole, logAdminAccessDebug, normalizeRole } from "./authRoles";

export type AppView = "landing" | "bootstrap" | "guide" | "projects" | "agents" | "llm" | "diagnostics" | "feed_admin" | "feed_coder" | "coder_profile" | "coder_directory" | "vision" | "not_found";

/**
 * Mounts global providers for toast feedback and authentication.
 * Used once at application startup so every screen can read auth state and show action results.
 */
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

/**
 * Routes users between public, builder and founder screens while preserving role-gated access.
 * Used after providers initialize and adds universal guidance so every major view explains state and next actions.
 */
function AppContent() {
  const { user, profile, loading, signIn, authError } = useAuth();
  const { t, tData } = useI18n();
  const {
    projects,
    agents,
    llmSettings,
    syncStatus,
    addProject,
    updateProject,
    deleteProject,
    duplicateProject,
    addAgent,
    updateAgent,
    deleteAgent,
    duplicateAgent,
    updateLLMSettings,
    syncOpenRouterModels, // was syncModels
    testConnection,
    generateIntelligenceForAll, // was generateIntelligence
    regenerateAllIntelligence,
    runSpecPipeline,
    runImagePipeline,
    isLoaded
  } = useWorkspace();

  const [view, setView] = useState<AppView>("landing");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;
  const activeAgent = activeAgentId ? agents.find(a => a.id === activeAgentId) : null;

  const translatedScreenGuidance = {
    landing: tData<TranslatedScreenGuidance>('guide.screens.landing'),
    bootstrap: tData<TranslatedScreenGuidance>('guide.screens.bootstrap'),
    guide: tData<TranslatedScreenGuidance>('guide.screens.guide'),
    adminPersistence: tData<TranslatedScreenGuidance>('guide.screens.adminPersistence'),
    settings: tData<TranslatedScreenGuidance>('guide.screens.settings'),
    liveFeed: tData<TranslatedScreenGuidance>('guide.screens.liveFeed'),
    profile: tData<TranslatedScreenGuidance>('guide.screens.profile')
  };

  const guidanceByView = {
    landing: translatedScreenGuidance.landing,
    bootstrap: translatedScreenGuidance.bootstrap,
    guide: translatedScreenGuidance.guide,
    projects: translatedScreenGuidance.adminPersistence,
    agents: translatedScreenGuidance.adminPersistence,
    llm: translatedScreenGuidance.settings,
    diagnostics: translatedScreenGuidance.settings,
    feed_admin: translatedScreenGuidance.liveFeed,
    feed_coder: translatedScreenGuidance.liveFeed,
    coder_profile: translatedScreenGuidance.profile,
    coder_directory: translatedScreenGuidance.profile,
    vision: { ...translatedScreenGuidance.guide, title: t('navigation.founderVision'), purpose: t('guide.screens.vision.purpose'), nextAction: t('guide.screens.vision.nextAction') },
    not_found: { ...translatedScreenGuidance.guide, title: t('errors.accessDenied'), purpose: t('guide.screens.notFound.purpose'), nextAction: t('guide.screens.notFound.nextAction') }
  } as const;

  const currentGuidance = guidanceByView[view];
  const resolvedRole = normalizeRole(profile?.role || (user ? "missing" : "anonymous"));
  const founderAdminViews: AppView[] = ["projects", "agents", "llm", "diagnostics", "feed_admin"];
  const requiresFounderAdmin = founderAdminViews.includes(view);
  const hasFounderAdminAccess = isFounderAdminRole(resolvedRole);

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="w-24 h-24 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-accent rounded-2xl animate-pulse" />
             </div>
          </div>
          <LoadingState
            title={loading ? t('app.loadingAuthTitle') : t('app.loadingSystemTitle')}
            description={loading ? t('app.loadingAuthDescription') : t('app.loadingSystemDescription')}
          />
        </div>
      </div>
    );
  }

  // Define public views
  const isPublicView = view === "landing" || view === "bootstrap" || view === "guide" || view === "vision" || view === "feed_coder" || view === "coder_directory" || view === "coder_profile";

  if (!user && !isPublicView) {
    return <LandingPage onEnter={signIn} />;
  }

  if (user && requiresFounderAdmin && !hasFounderAdminAccess) {
    const denial = describeMissingAdminAccess(profile, view);
    logAdminAccessDebug("route-protection-denied", {
      view,
      userId: user.uid,
      resolvedRole,
      profileRole: profile?.role,
      missingPermission: denial.missingPermission,
      hasProfile: Boolean(profile),
      authError
    });

    return (
      <AppShell currentView={view} setView={(v) => { setView(v); setActiveProjectId(null); setActiveAgentId(null); }}>
        <AdminAccessDenied {...denial} authError={authError} onNavigate={setView} />
      </AppShell>
    );
  }

  return (
    <AppShell currentView={view} setView={(v) => { setView(v); setActiveProjectId(null); setActiveAgentId(null); }}>
      <div className="px-4 pt-4 md:px-8">
        <HelpBlock
          title={currentGuidance.title}
          purpose={currentGuidance.purpose}
          state={currentGuidance.state}
          nextAction={currentGuidance.nextAction}
          disabledReason={currentGuidance.disabledReason}
          className="mx-auto max-w-6xl"
        />
      </div>
      {/* Landing Page */}
      {view === "landing" && <LandingPage onEnter={signIn} />}

      {/* Bootstrap Page */}
      {view === "bootstrap" && <BootstrapPage />}

      {/* Guide Page */}
      {view === "guide" && <GuidePage />}

      {/* Project Views */}
      {view === "projects" && !activeProject && (
        <ProjectDashboard 
          projects={projects}
          onNew={async () => { const id = await addProject(); if (id) setActiveProjectId(id); }}
          onOpen={setActiveProjectId}
          onDelete={deleteProject}
          onDuplicate={async (id) => { const newId = await duplicateProject(id); if (newId) setActiveProjectId(newId); }}
          onRename={(id, name) => updateProject(id, { name })}
          onExport={(id) => {
            const p = projects.find(proj => proj.id === id);
            if (p?.markdownExport) {
               const blob = new Blob([p.markdownExport], { type: 'text/markdown' });
               const url = URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = `${p.name.toLowerCase().replace(/\s+/g, '_')}_spec.md`;
               a.click();
            }
          }}
        />
      )}
      {view === "projects" && activeProject && (
        <ProjectWorkspace 
          project={activeProject}
          agents={agents}
          llmSettings={llmSettings}
          onUpdate={(updates) => updateProject(activeProject.id, updates)}
          onBack={() => setActiveProjectId(null)}
          runPipeline={runSpecPipeline}
          runImagePipeline={runImagePipeline}
        />
      )}

      {/* Agent Views */}
      {view === "agents" && !activeAgent && (
        <AgentList 
          agents={agents}
          onNew={async () => { const id = await addAgent(); setActiveAgentId(id); }}
          onOpen={setActiveAgentId}
          onDelete={deleteAgent}
          onDuplicate={duplicateAgent}
          onSetDefault={(id) => updateAgent(id, { isDefault: true })}
        />
      )}
      {view === "agents" && activeAgent && (
        <AgentEditor 
          agent={activeAgent}
          llmSettings={llmSettings}
          onUpdate={(updates) => updateAgent(activeAgent.id, updates)}
          onBack={() => setActiveAgentId(null)}
          onDelete={(id) => { deleteAgent(id); setActiveAgentId(null); }}
        />
      )}

      {/* Settings & Tools */}
      {view === "llm" && (
        <LLMSettingsPage 
          settings={llmSettings}
          onUpdate={(updates) => updateLLMSettings({ ...llmSettings, ...updates })}
          onSync={syncOpenRouterModels}
          onTestConnection={testConnection}
          onGenerateIntelligence={generateIntelligenceForAll}
          onRegenerateAll={regenerateAllIntelligence}
          syncStatus={syncStatus}
          onOpenDiagnostics={() => setView("diagnostics")}
        />
      )}
      {view === "diagnostics" && (
        <OpenRouterDiagnosticsPage 
          llmSettings={llmSettings} 
          onBack={() => setView("llm")} 
        />
      )}

      {/* Build Feed */}
      {view === "feed_admin" && <LiveBuildFeedAdmin />}
      {view === "feed_coder" && <LiveBuildFeed />}
      {view === "coder_profile" && <BuilderProfile />}
      {view === "coder_directory" && <VibeCoderDirectory />}
      {view === "vision" && <FounderVisionPage />}
      {view === "not_found" && <ErrorPage onNavigate={(v) => setView(v)} />}
    </AppShell>
  );
}


function AdminAccessDenied({
  title,
  message,
  view,
  resolvedRole,
  missingPermission,
  authError,
  onNavigate
}: ReturnType<typeof describeMissingAdminAccess> & { authError: string | null; onNavigate: (view: AppView) => void }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-red-500/30 bg-red-500/10 p-8 shadow-2xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-red-300">{t("errors.accessDenied")}</p>
        <h1 className="text-3xl font-black text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/75">{message}</p>
        <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm">
          <div className="flex justify-between gap-4"><span className="text-white/50">{t("errors.requestedScreen")}</span><span className="font-mono text-white">{view}</span></div>
          <div className="flex justify-between gap-4"><span className="text-white/50">{t("errors.resolvedRole")}</span><span className="font-mono text-yellow-200">{resolvedRole}</span></div>
          <div className="flex justify-between gap-4"><span className="text-white/50">{t("errors.missingPermission")}</span><span className="font-mono text-red-200">{missingPermission}</span></div>
          {authError && <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-yellow-100">Auth/profile error: {authError}</div>}
        </div>
        <p className="mt-5 text-xs leading-5 text-white/55">{t("errors.founderAccessHint")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => onNavigate("landing")} className="rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black">{t("buttons.goHome")}</button>
          <button onClick={() => onNavigate("guide")} className="rounded-xl border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10">{t("buttons.openGuide")}</button>
          <button onClick={() => onNavigate("feed_coder")} className="rounded-xl border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10">{t("buttons.liveFeed")}</button>
        </div>
      </div>
    </div>
  );
}
