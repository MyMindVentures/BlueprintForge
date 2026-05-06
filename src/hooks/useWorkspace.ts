import { useState, useEffect, useMemo } from "react";
import { Project, AIAgent, LLMSettings, OpenRouterModel } from "../types";
import { DEFAULT_AGENTS, INITIAL_MODELS } from "../constants";
import { useAuth } from "./useAuth";
import { buildFeedService } from "../services/buildFeedService";
import { 
  collection, query, where, onSnapshot, orderBy, 
  doc, setDoc, getDoc, serverTimestamp 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../services/firebase";
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

  // Sync projects and agents
  useEffect(() => {
    if (!user) {
      setIsLoaded(true);
      return;
    }

    // Projects listener
    const qProjects = query(collection(db, 'projects'), where('user_id', '==', user.uid), orderBy('updated_at', 'desc'));
    const unsubProjects = onSnapshot(qProjects, (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));

    // Agents listener
    const qAgents = query(collection(db, 'agents'), where('user_id', '==', user.uid));
    const unsubAgents = onSnapshot(qAgents, (snap) => {
      if (snap.empty) {
        // Seed default agents if none exist for user
        DEFAULT_AGENTS.forEach(async (a) => {
          const { id, ...data } = a;
          await setDoc(doc(collection(db, 'agents')), { ...data, user_id: user.uid, created_at: serverTimestamp(), updated_at: serverTimestamp() });
        });
      } else {
        setAgents(snap.docs.map(d => ({ id: d.id, ...d.data() } as AIAgent)));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'agents'));

    // Settings sync
    const qSettings = doc(db, 'settings', user.uid);
    const unsubSettings = onSnapshot(qSettings, (snap) => {
      if (snap.exists()) {
        setSettings(prev => ({ ...prev, ...snap.data() }));
      }
    });

    setIsLoaded(true);
    return () => {
      unsubProjects();
      unsubAgents();
      unsubSettings();
    };
  }, [user]);

  const updateLLMSettings = async (updates: Partial<LLMSettings>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'settings', user.uid), updates, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `settings/${user.uid}`);
    }
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
