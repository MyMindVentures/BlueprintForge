import { useState, useEffect, useMemo } from "react";
import { Project, AIAgent, LLMSettings, OpenRouterModel } from "../types";
import { DEFAULT_AGENTS, INITIAL_MODELS } from "../constants";
import { useAuth } from "./useAuth";
import { apiRequest, pollingIntervalMs } from "../services/apiClient";
import { useProjects } from "./useProjects";
import { useAgents } from "./useAgents";
import { useLLMSettings } from "./useLLMSettings";
import { usePipeline } from "./usePipeline";
import { useImagePipeline } from "./useImagePipeline";

/**
 * Handles the use workspace workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function useWorkspace() {
  const { user, profile } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [settings, setSettings] = useState<LLMSettings>({
    openRouterApiKey: "",
    apiKeySaved: false,
    connectionStatus: "Not tested",
    lastTestedAt: null,
    defaultModelId: "openai/gpt-4o-mini",
    models: INITIAL_MODELS.map(m => ({
      ...m,
      enabled: true,
      unavailable: false,
      description: "",
      pricing: {},
      architecture: {},
      topProvider: {},
      perRequestLimits: {},
      supportedParameters: [],
      intelligenceStatus: "Not generated",
      intelligenceError: null,
      updatedIntelligenceAt: null,
      capabilities: { supportsJson: true, supportsTools: true, supportsReasoning: false, supportsImages: false }
    } as OpenRouterModel)),
    lastSyncedAt: null
  });

  const { addProject, updateProject, deleteProject, duplicateProject } = useProjects(() => {}, agents, user?.uid);
  const { addAgent, updateAgent, deleteAgent, duplicateAgent } = useAgents(user?.uid);
  
  const agentNames = useMemo(() => agents.map(a => a.name), [agents]);
  const { syncStatus, syncModels, testConnection, generateIntelligence, regenerateAll } = useLLMSettings(settings, setSettings, agentNames);
  
  const { runPipeline } = usePipeline(projects, setProjects, agents, settings);
  const { startImagePipeline, regenerateSingleImage } = useImagePipeline(projects, setProjects);

  // Sync projects, agents and settings from PostgreSQL with polling while realtime parity is deferred.
  useEffect(() => {
    if (!user) {
      setIsLoaded(true);
      return;
    }

    let active = true;
    const userContext = { id: user.uid, name: profile?.name || user.uid, role: profile?.role || ('vibe_coder' as const) };
    const load = async () => {
      try {
        const [loadedProjects, loadedAgents, loadedSettings] = await Promise.all([
          apiRequest<Project[]>('/api/workspace/projects', { user: userContext }),
          apiRequest<AIAgent[]>('/api/workspace/agents', { user: userContext }),
          apiRequest<Partial<LLMSettings>>('/api/settings', { user: userContext })
        ]);
        if (!active) return;
        setProjects(loadedProjects);
        if (loadedAgents.length === 0) {
          await Promise.all(DEFAULT_AGENTS.map(({ id, ...agent }) => apiRequest('/api/workspace/agents', { method: 'POST', user: userContext, body: JSON.stringify({ data: { ...agent, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }) })));
        } else {
          setAgents(loadedAgents);
        }
        setSettings(prev => ({ ...prev, ...loadedSettings }));
        setIsLoaded(true);
      } catch (error) {
        console.error('PostgreSQL workspace polling failed:', error);
        setIsLoaded(true);
      }
    };
    load();
    const interval = window.setInterval(load, pollingIntervalMs);
    return () => { active = false; window.clearInterval(interval); };
  }, [user, profile]);

  const updateLLMSettings = async (updates: Partial<LLMSettings>) => {
    if (!user) return;
    const userContext = { id: user.uid, name: profile?.name || user.uid, role: profile?.role || ('vibe_coder' as const) };
    await apiRequest('/api/settings', { method: 'PATCH', user: userContext, body: JSON.stringify({ data: updates }) });
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    duplicateProject: (id: string) => duplicateProject(id, projects),
    
    agents,
    addAgent,
    updateAgent: (id: string, updates: Partial<AIAgent>) => updateAgent(id, updates, agents),
    deleteAgent,
    duplicateAgent: (id: string) => duplicateAgent(id, agents),
    
    llmSettings: settings,
    updateLLMSettings,
    syncOpenRouterModels: syncModels,
    testConnection,
    generateIntelligenceForAll: generateIntelligence,
    regenerateAllIntelligence: regenerateAll,
    
    runSpecPipeline: runPipeline,
    runImagePipeline: startImagePipeline,
    regenerateImage: regenerateSingleImage,
    syncStatus,
    isLoaded
  };
}
