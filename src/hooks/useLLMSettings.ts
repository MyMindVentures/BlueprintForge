import { useState, useCallback, useRef, useEffect } from "react";
import { LLMSettings, OpenRouterModel } from "../types";
import { testOpenRouterConnection } from "../services/openRouterClient";
import { syncOpenRouterModels, mergeSyncedModels, validateSyncedModels } from "../services/openRouterModelService";
import { generateModelIntelligence } from "../services/modelIntelligenceService";
import { apiRequest } from '../services/apiClient';
import { useAuth } from './useAuth';
import { normalizeRole } from '../authRoles';
import { createSafeError, getErrorStatus, getErrorTranslationKey, toSafeError } from '../i18n/errorMessages';

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

/**
 * Handles the use llmsettings workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function useLLMSettings(
  settings: LLMSettings,
  setSettings: (s: LLMSettings | ((prev: LLMSettings) => LLMSettings)) => void,
  agentNames: string[]
) {
  const { user, profile } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    phase: "idle", total: 0, completed: 0, failed: 0, mappingFailed: 0, currentModelName: "", error: null
  });

  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const updateSettingsPostgres = async (updates: Partial<LLMSettings>) => {
    if (!user) {
      setSettings(prev => ({ ...prev, ...updates }));
      return;
    }
    try {
      await apiRequest('/api/settings', { method: 'PATCH', user: { id: user.uid, name: profile?.name || user.displayName || user.uid, role: normalizeRole(profile?.role) as any }, body: JSON.stringify({ data: updates }) });
    } catch (e) {
      console.error('PostgreSQL settings update failed:', e);
    }
  };

  const syncModels = async () => {
    const current = settingsRef.current;
    if (!current.openRouterApiKey) throw createSafeError("OPENROUTER_API_KEY_MISSING");

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
        throw createSafeError("OPENROUTER_MANIFEST_INVALID");
      }

      const mergedModels = mergeSyncedModels(current.models, fetchedModels);

      await updateSettingsPostgres({
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
        error: getErrorTranslationKey(e),
        errorDetail: {
          status: getErrorStatus(e),
          message: getErrorTranslationKey(e),
          endpoint: "https://openrouter.ai/api/v1/models",
          timestamp: new Date().toISOString()
        }
      }));
      throw toSafeError(e, "errors.syncFailed");
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

        await updateSettingsPostgres({ models: latestModels });
        completedCounter++;
      } catch (e: any) {
        failedCounter++;
        const latestModels = settingsRef.current.models.map(m => m.id === model.id ? {
          ...m,
          intelligenceStatus: "Failed" as const,
          intelligenceError: getErrorTranslationKey(e)
        } : m);
        await updateSettingsPostgres({ models: latestModels });
      }
      setSyncStatus(prev => ({ ...prev, completed: completedCounter, failed: failedCounter }));
    }

    setSyncStatus(prev => ({ ...prev, phase: failedCounter > 0 ? "warning" : "success" }));
    setTimeout(() => setSyncStatus(prev => ({ ...prev, phase: "idle" })), 5000);
  };

  const testConnection = async (key: string) => {
    try {
      await testOpenRouterConnection(key);
      await updateSettingsPostgres({ openRouterApiKey: key, apiKeySaved: true, connectionStatus: "Connected", lastTestedAt: new Date().toISOString() });
      return { success: true };
    } catch (e: any) {
      await updateSettingsPostgres({ connectionStatus: "Error", lastTestedAt: new Date().toISOString() });
      throw toSafeError(e);
    }
  };

  return { syncStatus, syncModels, testConnection, generateIntelligence: () => generateIntelligenceInternal(settings.models, false), regenerateAll: () => generateIntelligenceInternal(settings.models, true) };
}
