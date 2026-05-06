/**
 * OpenRouter Model Definition
 */
export interface OpenRouterModel {
  id: string;
  name: string;
  provider: string | null;
  description: string;
  contextLength: number | null;
  pricing: any;
  architecture: any;
  topProvider: any;
  perRequestLimits: any;
  supportedParameters: string[];
  capabilities: {
    supportsTools: boolean;
    supportsJson: boolean;
    supportsReasoning: boolean;
    supportsImages: boolean;
  };
  enabled: boolean;
  unavailable: boolean;
  userNotes?: string;

  // Intelligence fields
  strengths?: string[];
  weaknesses?: string[];
  recommendedAgentTypes?: {
    agentType: string;
    reason: string;
    rating: 1 | 2 | 3 | 4 | 5;
  }[];
  intelligenceStatus: "Not generated" | "Generating" | "Ready" | "Failed" | "Outdated";
  intelligenceError: string | null;
  updatedIntelligenceAt: string | null;
}

/**
 * Global LLM Settings (OpenRouter only)
 */
export type ConnectionStatus = "Not tested" | "Connected" | "Invalid" | "No Credits" | "Rate Limited" | "Error" | "Network Error";

export interface LLMSettings {
  openRouterApiKey: string;
  apiKeySaved: boolean;
  connectionStatus: ConnectionStatus;
  lastTestedAt: string | null;
  defaultModelId: string | null;
  models: OpenRouterModel[];
  lastSyncedAt: string | null;
}
