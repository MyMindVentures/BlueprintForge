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
import { HelpBlock } from "./components/help/HelpBlock";
import { LoadingState } from "./components/state/LoadingState";
import { screenGuidance } from "./content/guides/blueprintGuides";

export type AppView = "landing" | "bootstrap" | "guide" | "projects" | "agents" | "llm" | "diagnostics" | "feed_admin" | "feed_coder" | "coder_profile" | "coder_directory" | "vision" | "not_found";

/**
 * Mounts global providers for toast feedback and authentication.
 * Used once at application startup so every screen can read auth state and show action results.
 */
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

/**
 * Routes users between public, builder and founder screens while preserving role-gated access.
 * Used after providers initialize and adds universal guidance so every major view explains state and next actions.
 */
function AppContent() {
  const { user, profile, loading, signIn } = useAuth();
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

  const guidanceByView = {
    landing: screenGuidance.landing,
    bootstrap: screenGuidance.bootstrap,
    guide: screenGuidance.guide,
    projects: screenGuidance.adminPersistence,
    agents: screenGuidance.adminPersistence,
    llm: screenGuidance.settings,
    diagnostics: screenGuidance.settings,
    feed_admin: screenGuidance.liveFeed,
    feed_coder: screenGuidance.liveFeed,
    coder_profile: screenGuidance.profile,
    coder_directory: screenGuidance.profile,
    vision: { ...screenGuidance.guide, title: 'Founder Vision', purpose: 'Connect strategic product direction to visible build progress.', nextAction: 'Read the current vision, then open Current Founder Focus to see execution.' },
    not_found: { ...screenGuidance.guide, title: 'Error / Not Found', purpose: 'Explain that the requested screen is unavailable and offer safe navigation.', nextAction: 'Return to Landing, Guide or Live Build Feed.' }
  } as const;

  const currentGuidance = guidanceByView[view];

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
            title={loading ? 'Authentication initializing' : 'Architect system initializing'}
            description={loading ? 'Checking whether you are a visitor, builder or founder before enabling actions.' : 'Loading persisted projects, agents, settings and live platform state.'}
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
