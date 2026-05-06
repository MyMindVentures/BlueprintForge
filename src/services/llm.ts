import { AppSpec, AIAgent, OpenRouterModel } from "../types";
import { AGENT_SYSTEM_PROMPT_TEMPLATE, USER_PROMPT_TEMPLATE } from "../constants";

const APP_NAME = "BlueprintForge AI";
const APP_URL = typeof window !== "undefined" ? window.location.origin : "https://blueprintforge.ai";

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
    throw new Error("OpenRouter API Key is missing. Please check your settings.");
  }
  
  // Ensure we have a string and trim it
  // Printable ASCII is safer for API keys
  const keyStr = String(apiKey).trim().replace(/[^\x21-\x7E]/g, "");
  
  if (keyStr.length < 5) {
    throw new Error("OpenRouter API Key appears invalid or too short.");
  }

  // Ensure Bearer prefix
  return keyStr.startsWith("Bearer ") ? keyStr : `Bearer ${keyStr}`;
}

/**
 * Standard headers for all OpenRouter requests
 */
function getHeaders(apiKey: string): Record<string, string> {
  const auth = getAuthHeader(apiKey);
  
  const headers: Record<string, string> = {
    "Authorization": cleanHeaderValue(auth),
    "Content-Type": "application/json"
  };

  if (typeof window !== "undefined") {
    const title = String(APP_NAME).replace(/[^\w\s-]/g, "");
    headers["X-Title"] = cleanHeaderValue(title);
    
    // Some models or OpenRouter versions might be picky about referer
    if (window.location.hostname && window.location.origin && window.location.origin !== "null") {
      headers["HTTP-Referer"] = cleanHeaderValue(window.location.origin);
    }
  }

  return headers;
}

/**
 * Safe debug logging for failed requests (Redacts API keys)
 */
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

/**
 * Robust error handling for OpenRouter responses
 */
async function handleResponse(response: Response, endpoint: string = "unknown", modelId: string | null = null, payloadSize: number = 0) {
  if (!response.ok) {
    const text = await response.text();
    let errorData;
    let message = `API Error: ${response.status} ${response.statusText}`;

    try {
      errorData = JSON.parse(text);
      if (errorData.error?.message) {
        message = errorData.error.message;
      } else if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      if (text && text.length < 500) {
        message = text;
      }
    }
    
    logDebugError({
      endpoint,
      status: response.status,
      selectedModel: modelId,
      payloadSize,
      errorMessage: message
    });

    // Categorize common errors for better UX
    if (response.status === 401) {
      throw new Error(`Authentication Error (401): ${message !== `API Error: 401 Unauthorized` ? message : "Invalid key or model access restricted."}`);
    }
    if (response.status === 402) throw new Error("Payment Required (402): API key valid but no credits available.");
    if (response.status === 403) throw new Error(`Forbidden (403): ${message}`);
    if (response.status === 429) throw new Error("Rate Limited (429): Too many requests. Try again later.");
    if (response.status >= 500) throw new Error("OpenRouter Server Error (5xx): Try again later.");
    
    throw new Error(message);
  }
  return response.json();
}

/**
 * 1. Test OpenRouter Connection
 */
export async function testOpenRouterConnection(apiKey: string): Promise<boolean> {
  try {
    await fetchOpenRouterModels(apiKey);
    return true;
  } catch (e: any) {
    throw e;
  }
}

/**
 * 2. Fetch OpenRouter Models
 */
export async function fetchOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
  const url = "https://openrouter.ai/api/v1/models";
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(apiKey)
  });

  const data = await handleResponse(response, url);
  const models = data.data || [];
  
  return models.map((m: any) => ({
    id: m.id,
    name: m.name,
    provider: m.id.split("/")[0],
    contextLength: m.context_length,
    pricing: m.pricing ? { prompt: m.pricing.prompt, completion: m.pricing.completion } : null,
    capabilities: {
      vision: m.description?.toLowerCase().includes("vision") || false,
      tools: true,
      json: true
    },
    enabled: true // Default enabled state
  }));
}

/**
 * 3. Call OpenRouter Chat Completion
 */
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
  const { apiKey, model, messages, temperature, maxTokens, responseFormat } = params;
  const url = "https://openrouter.ai/api/v1/chat/completions";

  const body = JSON.stringify({
      model,
      messages,
      temperature: temperature ?? 0.2, // Lower default temp for structured tasks
      max_tokens: maxTokens ?? 4000,
      response_format: responseFormat
    });

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(apiKey),
    body
  });

  const data = await handleResponse(response, url, model, body.length);
  if (!data.choices || data.choices.length === 0) {
    throw new Error("OpenRouter returned an empty response. Please try again or select a different model.");
  }

  return data.choices[0].message.content;
}

/**
 * Model Intelligence Generation
 */
export async function generateModelIntelligence(
  apiKey: string,
  analysisModelId: string,
  targetModel: OpenRouterModel,
  agentNames: string[]
): Promise<any> {
  const systemPrompt = `You are an expert LLM evaluator.
Given this OpenRouter model metadata and the list of available AI agents, produce concise model intelligence.

Available AI Agents:
${agentNames.join(", ")}

General Categories:
Structured Spec Agent, Markdown Export Agent, JSON Output Agent, Card Generation Agent, Validation Agent, Product Strategy Agent, UX Writing Agent, Technical Architecture Agent

Return JSON only:
{
  "description": "Short practical description of the model.",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendedAgentTypes": [
    {
      "agentType": "Name of AI agent or general agent category",
      "reason": "Short reason",
      "rating": 1
    }
  ]
}

Rules:
* Use ratings from 1 to 5
* Use exact field names
* Respond with valid JSON only`;

  const userPrompt = `Model Metadata:
ID: ${targetModel.id}
Name: ${targetModel.name}
Context: ${targetModel.contextLength}
Pricing: ${JSON.stringify(targetModel.pricing)}
Capabilities: ${JSON.stringify(targetModel.capabilities)}`;

  try {
    const content = await callOpenRouterChatCompletion({
      apiKey,
      model: analysisModelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      responseFormat: { type: "json_object" }
    });

    return JSON.parse(content);
  } catch (e: any) {
    // Retry without JSON mode if it fails
    if (e.message.includes("response_format") || e.message.includes("JSON")) {
      const content = await callOpenRouterChatCompletion({
        apiKey,
        model: analysisModelId,
        messages: [
          { role: "system", content: systemPrompt + "\n\nCRITICAL: Respond ONLY with a valid JSON object." },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2
      });
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Model failed to return valid JSON intelligence.");
      return JSON.parse(jsonMatch[0]);
    }
    throw e;
  }
}

/**
 * Main Conversion Function (Refined)
 */
export interface ConversionParams {
  rawConcept: string;
  agent: AIAgent;
  openRouterApiKey: string;
  modelId: string;
  allAgents?: AIAgent[];
}

/**
 * Handles the convert project to spec workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export async function convertProjectToSpec(params: ConversionParams): Promise<AppSpec> {
  const { rawConcept, agent, openRouterApiKey, modelId, allAgents } = params;

  if (!rawConcept.trim()) throw new Error("Raw concept is empty. Please describe what you want to build.");
  if (!openRouterApiKey) throw new Error("OpenRouter API Key is missing. Please check OpenRouter Settings.");
  if (!agent || agent.status !== "Active") throw new Error("Selected agent is missing or inactive.");

  // Handle Pipeline (AGENT-09)
  if (agent.code === "AGENT-09" && allAgents) {
    return await runOrchestratorPipeline(params, allAgents);
  }

  const systemInstruction = AGENT_SYSTEM_PROMPT_TEMPLATE(agent);
  const userPrompt = USER_PROMPT_TEMPLATE(rawConcept);

  const needsJson = agent.outputType === "Cards + Markdown" || agent.outputType === "JSON only";

  const content = await callOpenRouterChatCompletion({
    apiKey: openRouterApiKey,
    model: modelId,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt }
    ],
    temperature: agent.temperature,
    maxTokens: agent.maxOutputTokens,
    responseFormat: needsJson ? { type: "json_object" } : undefined
  });

  try {
    if (agent.outputType === "Markdown only") {
      return {
        app: {
          sections: [],
          markdown: content
        }
      };
    }

    const parsed = JSON.parse(content);
    
    // Normalize response based on requested output
    if (agent.outputType === "JSON only") {
      return {
        app: {
          sections: [],
          markdown: "```json\n" + JSON.stringify(parsed, null, 2) + "\n```"
        }
      };
    }

    if (agent.outputType === "Cards only") {
      return {
        app: {
          sections: parsed.sections || parsed.app?.sections || [],
          markdown: ""
        }
      };
    }

    // Default: Cards + Markdown
    if (parsed.app) return parsed as AppSpec;
    if (parsed.cardStructure && parsed.markdownExport) {
        return {
            app: {
                sections: parsed.cardStructure,
                markdown: parsed.markdownExport
            }
        };
    }
    
    return {
        app: {
            sections: parsed.sections || [],
            markdown: parsed.markdown || ""
        }
    };

  } catch (e) {
    // Fallback parsing for models that don't support JSON mode correctly
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch && needsJson) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
            app: {
                sections: parsed.sections || parsed.app?.sections || parsed.cardStructure || [],
                markdown: parsed.markdown || parsed.app?.markdown || parsed.markdownExport || ""
            }
        };
      } catch (inner) {}
    }

    // Ultimate fallback as Markdown
    return {
      app: {
        sections: [],
        markdown: content
      }
    };
  }
}

async function runOrchestratorPipeline(params: ConversionParams, agents: AIAgent[]): Promise<AppSpec> {
  const { rawConcept } = params;
  
  // 1. Structured Spec Agent (AGENT-01)
  const agent01 = agents.find(a => a.code === "AGENT-01");
  if (!agent01) throw new Error("AGENT-01 not found for orchestration.");
  
  const spec = await convertProjectToSpec({
    ...params,
    agent: agent01,
  });

  // 2. Validation Agent (AGENT-02)
  const agent02 = agents.find(a => a.code === "AGENT-02");
  if (agent02) {
    try {
      await convertProjectToSpec({
        ...params,
        agent: agent02,
        rawConcept: `Validate this spec:\n\n${spec.app.markdown}\n\nJSON structure:\n${JSON.stringify(spec.app.sections)}`
      });
    } catch (e) {
      console.warn("Validation failed, continuing...");
    }
  }

  // 3. Optimization Agent (AGENT-04)
  const agent04 = agents.find(a => a.code === "AGENT-04");
  if (agent04) {
    try {
      const optimizedSpec = await convertProjectToSpec({
        ...params,
        agent: agent04,
        rawConcept: `Optimize this spec while preserving all features:\n\n${spec.app.markdown}\n\nJSON structure:\n${JSON.stringify(spec.app.sections)}`
      });
      spec.app = optimizedSpec.app;
    } catch (e) {
      console.warn("Optimization failed, continuing...");
    }
  }

  return spec;
}

// Deprecated functions for compatibility during transition
export const convertWithAgent = convertProjectToSpec;
/**
 * Handles the test model connection workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export const testModelConnection = async (apiKey: string) => {
    try {
        const models = await fetchOpenRouterModels(apiKey);
        return { models };
    } catch (e: any) {
        throw new Error(e.message);
    }
};
