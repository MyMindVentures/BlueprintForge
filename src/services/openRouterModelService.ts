import { createSafeError } from '../i18n/errorMessages';
import { OpenRouterModel } from "../types";

/**
 * Standard headers for all OpenRouter model requests
 */
export function buildModelHeaders(apiKey: string): Record<string, string> {
  return {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://blueprintforge.ai",
    "X-OpenRouter-Title": "BlueprintForge AI"
  };
}

/**
 * Maps raw OpenRouter API model data to our local schema
 */
export function mapOpenRouterModel(raw: any): OpenRouterModel {
  const supportedParams = raw.supported_parameters || [];
  const architecture = raw.architecture || {};
  const modalities = architecture.input_modalities || [];

  return {
    id: raw.id,
    name: raw.name || raw.id,
    provider: raw.id?.split("/")[0] || null,
    description: raw.description || "",
    contextLength: raw.context_length || raw.contextLength || null,
    pricing: raw.pricing || null,
    architecture: architecture,
    topProvider: raw.top_provider || null,
    perRequestLimits: raw.per_request_limits || null,
    supportedParameters: supportedParams,
    capabilities: {
      supportsTools: supportedParams.includes("tools"),
      supportsJson: supportedParams.includes("response_format"),
      supportsReasoning: supportedParams.includes("reasoning"),
      supportsImages: modalities.includes("image")
    },
    enabled: true,
    unavailable: false,
    intelligenceStatus: "Not generated",
    intelligenceError: null,
    updatedIntelligenceAt: null
  };
}

/**
 * Merges newly synced models with existing user data
 */
export function mergeSyncedModels(existingModels: OpenRouterModel[], syncedModels: OpenRouterModel[]): OpenRouterModel[] {
  const existingMap = new Map(existingModels.map(m => [m.id, m]));
  
  // Track which current models are in the sync set
  const syncIds = new Set(syncedModels.map(m => m.id));

  const result: OpenRouterModel[] = syncedModels.map(synced => {
    const existing = existingMap.get(synced.id);
    if (!existing) return synced;

    // Preserve user-controlled and AI-generated fields
    return {
      ...synced,
      enabled: existing.enabled,
      userNotes: existing.userNotes,
      strengths: existing.strengths,
      weaknesses: existing.weaknesses,
      recommendedAgentTypes: existing.recommendedAgentTypes,
      intelligenceStatus: existing.intelligenceStatus,
      intelligenceError: existing.intelligenceError,
      updatedIntelligenceAt: existing.updatedIntelligenceAt
    };
  });

  // Keep old models that weren't in the sync list, but mark them as unavailable
  existingModels.forEach(old => {
    if (!syncIds.has(old.id)) {
      result.push({
        ...old,
        unavailable: true
      });
    }
  });

  return result;
}

/**
 * Sync OpenRouter models from API
 */
export async function syncOpenRouterModels(apiKey: string): Promise<{ models: OpenRouterModel[], failedCount: number }> {
  const url = "/api/ai/models";
  const response = await fetch(url, {
    method: "GET",
    headers: { "Authorization": `Bearer ${apiKey}` }
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      message = err.error?.message || err.message || message;
    } catch { /* ignore */ }

    if (response.status === 401) throw createSafeError("OPENROUTER_API_KEY_INVALID", { status: response.status, backendMessage: message });
    if (response.status === 402) throw createSafeError("OPENROUTER_NO_CREDITS", { status: response.status, backendMessage: message });
    if (response.status === 429) throw createSafeError("OPENROUTER_RATE_LIMITED", { status: response.status, backendMessage: message });
    if (response.status >= 500) throw createSafeError("OPENROUTER_SERVICE_ERROR", { status: response.status, backendMessage: message });
    throw createSafeError("REQUEST_FAILED", { status: response.status, backendMessage: message });
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.data)) {
    throw createSafeError("OPENROUTER_MANIFEST_INVALID");
  }

  let failedCount = 0;
  const mappedModels = data.data.map((m: any) => {
    try {
      return mapOpenRouterModel(m);
    } catch (e) {
      failedCount++;
      return null;
    }
  }).filter(Boolean) as OpenRouterModel[];

  return { models: mappedModels, failedCount };
}

/**
 * Fetch detailed information for a specific model (optional extra metadata)
 */
export async function fetchModelDetails(apiKey: string, modelId: string): Promise<OpenRouterModel | null> {
  const url = `https://openrouter.ai/api/v1/models/${modelId}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: buildModelHeaders(apiKey)
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data ? mapOpenRouterModel(data.data) : null;
  } catch {
    return null;
  }
}

/**
 * Validates synced models to ensure they meet basic criteria
 */
export function validateSyncedModels(models: OpenRouterModel[]): boolean {
  return Array.isArray(models) && models.length > 0 && models.every(m => !!m.id && !!m.name);
}
