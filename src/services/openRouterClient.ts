import { createSafeError } from "../i18n/errorMessages";

const APP_NAME = "BlueprintForge AI";

/**
 * Clean string for safe Header usage (ISO-8859-1 only)
 */
function cleanHeaderValue(value: string): string {
  return String(value).replace(/[^\x00-\xFF]/g, "").trim();
}

/**
 * Clean API Key and handle potential Bearer prefix
 */
function getAuthHeader(apiKey: string): string {
  if (!apiKey) {
    throw createSafeError("OPENROUTER_API_KEY_MISSING");
  }
  const keyStr = String(apiKey).trim().replace(/[^\x21-\x7E]/g, "");
  if (keyStr.length < 5) {
    throw createSafeError("OPENROUTER_API_KEY_INVALID");
  }
  return keyStr.startsWith("Bearer ") ? keyStr : `Bearer ${keyStr}`;
}

/**
 * Standard headers for all OpenRouter requests
 */
export function buildOpenRouterHeaders(apiKey: string): Record<string, string> {
  return {
    "Authorization": getAuthHeader(apiKey),
    "Content-Type": "application/json",
    "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://blueprintforge.ai",
    "X-OpenRouter-Title": APP_NAME
  };
}

export interface DebugErrorInfo {
  endpoint: string;
  status: number | null;
  selectedModel: string | null;
  payloadSize: number;
  errorMessage: string;
  timestamp: string;
}

let lastDebugError: DebugErrorInfo | null = null;

/**
 * Handles the get last debug error workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function getLastDebugError(): DebugErrorInfo | null {
  return lastDebugError;
}

function logDebugError(info: Omit<DebugErrorInfo, 'timestamp'>) {
  lastDebugError = {
    ...info,
    timestamp: new Date().toISOString()
  };
  console.warn("OpenRouter API Failed:", lastDebugError);
}

async function handleResponse(response: Response, endpoint: string = "unknown", modelId: string | null = null, payloadSize: number = 0) {
  if (!response.ok) {
    const text = await response.text();
    let message = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = JSON.parse(text);
      message = errorData.error?.message || errorData.message || message;
    } catch {
      if (text && text.length < 500) message = text;
    }
    
    logDebugError({ endpoint, status: response.status, selectedModel: modelId, payloadSize, errorMessage: message });

    if (response.status === 401) throw createSafeError("OPENROUTER_API_KEY_INVALID", { status: response.status, backendMessage: message });
    if (response.status === 402) throw createSafeError("OPENROUTER_NO_CREDITS", { status: response.status, backendMessage: message });
    if (response.status === 429) throw createSafeError("OPENROUTER_RATE_LIMITED", { status: response.status, backendMessage: message });
    if (response.status >= 500) throw createSafeError("OPENROUTER_SERVICE_ERROR", { status: response.status, backendMessage: message });
    throw createSafeError("REQUEST_FAILED", { status: response.status, backendMessage: message });
  }
  return response.json();
}

/**
 * Handles the test open router connection workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export async function testOpenRouterConnection(apiKey: string): Promise<boolean> {
  const url = "/api/ai/models";
  const response = await fetch(url, { method: "GET", headers: { "Authorization": getAuthHeader(apiKey) } });
  await handleResponse(response, url);
  return true;
}

export interface ChatCompletionParams {
  apiKey: string;
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
}

/**
 * Handles the call open router chat completion workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export async function callOpenRouterChatCompletion(params: ChatCompletionParams): Promise<string> {
  let { apiKey, model, messages, temperature, maxTokens, responseFormat } = params;
  
  if (model === "anthropic/claude-3.5-sonnet") {
    model = "anthropic/claude-3.7-sonnet";
  }

  const url = "/api/ai/chat/completions";
  const body = JSON.stringify({
    model,
    messages,
    temperature: temperature ?? 0.2,
    max_tokens: maxTokens ?? 4000,
    response_format: responseFormat
  });

  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": getAuthHeader(apiKey) }, body });
  
  if (!response.ok) {
    const text = await response.text();
    let message = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = JSON.parse(text);
      message = errorData.error?.message || errorData.message || message;
    } catch {
      if (text && text.length < 500) message = text;
    }

    // Auto-fallback if the model isn't available
    if (message.includes("No endpoints found") && model !== "openai/gpt-4o-mini") {
      console.warn(`Model ${model} unavailable. Falling back to openai/gpt-4o-mini.`);
      return callOpenRouterChatCompletion({
        ...params,
        model: "openai/gpt-4o-mini"
      });
    }

    logDebugError({ endpoint: url, status: response.status, selectedModel: model, payloadSize: body.length, errorMessage: message });

    if (response.status === 401) throw createSafeError("OPENROUTER_API_KEY_INVALID", { status: response.status, backendMessage: message });
    if (response.status === 402) throw createSafeError("OPENROUTER_NO_CREDITS", { status: response.status, backendMessage: message });
    if (response.status === 429) throw createSafeError("OPENROUTER_RATE_LIMITED", { status: response.status, backendMessage: message });
    if (response.status >= 500) throw createSafeError("OPENROUTER_SERVICE_ERROR", { status: response.status, backendMessage: message });
    throw createSafeError("REQUEST_FAILED", { status: response.status, backendMessage: message });
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) throw createSafeError("OPENROUTER_EMPTY_RESPONSE");
  return data.choices[0].message.content;
}
