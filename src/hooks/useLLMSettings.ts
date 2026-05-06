import { useState, useCallback, useRef, useEffect } from "react";
import { LLMSettings, OpenRouterModel } from "../types";
import { testOpenRouterConnection } from "../services/openRouterClient";
import { syncOpenRouterModels, mergeSyncedModels, validateSyncedModels } from "../services/openRouterModelService";
import { generateModelIntelligence } from "../services/modelIntelligenceService";
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from './useAuth';

export interface SyncStatus {
  phase: "idle" | "syncing" | "intelligence" | "success" | "error" | "warning";
  total: number;
  completed: number;
  failed: number;
  mappingFailed: number;
  currentModelName: string;
  error: string | null;
  errorDetail?: {
    status: number | null;
    message: string;
    endpoint: string;
    timestamp: string;
  } | null;
}

export function useLLMSettings(
  settings: LLMSettings, 
  setSettings: (s: LLMSettings | ((prev: LLMSettings) => LLMSettings)) => void,
  agentNames: string[]
) {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    phase: "idle", total: 0, completed: 0, failed: 0, mappingFailed: 0, currentModelName: "", error: null
  });

  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const updateSettingsFirebase = async (updates: Partial<LLMSettings>) => {
    if (!user) {
      setSettings(prev => ({ ...prev, ...updates }));
      return;
    }
    try {
      await updateDoc(doc(db, 'settings', user.uid), {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `settings/${user.uid}`);
    }
  };

  const syncModels = async () => {
    const current = settingsRef.current;
    if (!current.openRouterApiKey) throw new Error("API Key missing.");

    setSyncStatus({ 
      phase: "syncing", 
      total: 0, 
      completed: 0, 
      failed: 0, 
      mappingFailed: 0, 
      currentModelName: "Synchronizing manifest...", 
      error: null 
    });

    try {
      const { models: fetchedModels, failedCount } = await syncOpenRouterModels(current.openRouterApiKey);
      
      if (!validateSyncedModels(fetchedModels)) {
        throw new Error("OpenRouter manifest validation failed: Invalid or empty model set.");
      }

      const mergedModels = mergeSyncedModels(current.models, fetchedModels);

      await updateSettingsFirebase({ 
        models: mergedModels, 
        lastSyncedAt: new Date().toISOString(),
        connectionStatus: "Connected",
        lastTestedAt: new Date().toISOString()
      });

      setSyncStatus(prev => ({ ...prev, mappingFailed: failedCount }));

      // Automatically generate intelligence for missing models
      await generateIntelligenceInternal(mergedModels, false);
    } catch (e: any) {
      setSyncStatus(prev => ({ 
        ...prev, 
        phase: "error", 
        error: e.message,
        errorDetail: {
          status: e.message.includes("401") ? 401 : e.message.includes("402") ? 402 : e.message.includes("429") ? 429 : 500,
          message: e.message,
          endpoint: "https://openrouter.ai/api/v1/models",
          timestamp: new Date().toISOString()
        }
      }));
      throw e;
    }
  };

  const generateIntelligenceInternal = async (targetModelsList: OpenRouterModel[], force: boolean) => {
    const apiKey = settingsRef.current.openRouterApiKey;
    if (!apiKey) return;

    const targets = targetModelsList.filter(m => {
      if (!m.enabled || m.id.startsWith("~") || m.unavailable) return false;
      if (force) return true;
      return m.intelligenceStatus !== "Ready";
    });

    if (targets.length === 0) {
      setSyncStatus(prev => ({ ...prev, phase: "success" }));
      setTimeout(() => setSyncStatus(prev => ({ ...prev, phase: "idle" })), 3000);
      return;
    }

    setSyncStatus(prev => ({ 
      ...prev, 
      phase: "intelligence", 
      total: targets.length, 
      completed: 0, 
      failed: 0 
    }));

    let completedCounter = 0;
    let failedCounter = 0;

    for (const model of targets) {
      setSyncStatus(prev => ({ ...prev, currentModelName: model.name }));
      
      try {
        const analysisModelId = settingsRef.current.defaultModelId || "openai/gpt-4o-mini";
        const intelligence = await generateModelIntelligence(apiKey, analysisModelId, model, agentNames);
        
        const latestModels = settingsRef.current.models.map(m => m.id === model.id ? { 
          ...m, 
          ...intelligence, 
          intelligenceStatus: "Ready" as const, 
          updatedIntelligenceAt: new Date().toISOString() 
        } : m);

        await updateSettingsFirebase({ models: latestModels });
        completedCounter++;
      } catch (e: any) {
        failedCounter++;
        const latestModels = settingsRef.current.models.map(m => m.id === model.id ? { 
          ...m, 
          intelligenceStatus: "Failed" as const, 
          intelligenceError: e.message 
        } : m);
        await updateSettingsFirebase({ models: latestModels });
      }
      setSyncStatus(prev => ({ ...prev, completed: completedCounter, failed: failedCounter }));
    }

    setSyncStatus(prev => ({ ...prev, phase: failedCounter > 0 ? "warning" : "success" }));
    setTimeout(() => setSyncStatus(prev => ({ ...prev, phase: "idle" })), 5000);
  };

  const testConnection = async (key: string) => {
    try {
      await testOpenRouterConnection(key);
      await updateSettingsFirebase({ openRouterApiKey: key, apiKeySaved: true, connectionStatus: "Connected", lastTestedAt: new Date().toISOString() });
      return { success: true };
    } catch (e: any) {
      await updateSettingsFirebase({ connectionStatus: "Error", lastTestedAt: new Date().toISOString() });
      throw e;
    }
  };

  return { syncStatus, syncModels, testConnection, generateIntelligence: () => generateIntelligenceInternal(settings.models, false), regenerateAll: () => generateIntelligenceInternal(settings.models, true) };
}
