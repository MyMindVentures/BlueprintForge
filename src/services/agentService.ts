import { AIAgent, AppSpec } from "../types";
import { AGENT_SYSTEM_PROMPT_TEMPLATE, USER_PROMPT_TEMPLATE } from "../constants";
import { callOpenRouterChatCompletion } from "./openRouterClient";

export interface ConversionParams {
  rawConcept: string;
  agent: AIAgent;
  openRouterApiKey: string;
  modelId: string;
}

/**
 * Handles the run agent step workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export async function runAgentStep(params: ConversionParams): Promise<AppSpec> {
  const { rawConcept, agent, openRouterApiKey, modelId } = params;

  if (!rawConcept.trim()) throw new Error("Concept is empty.");
  if (!openRouterApiKey) throw new Error("API Key is missing.");
  if (!agent || agent.status !== "Active") throw new Error("Agent inactive.");

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

  return parseAgentResponse(content, agent, needsJson);
}

/**
 * Handles the parse agent response workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function parseAgentResponse(content: string, agent: AIAgent, needsJson: boolean): AppSpec {
  try {
    if (agent.outputType === "Markdown only") {
      return { app: { sections: [], markdown: content } };
    }

    const parsed = JSON.parse(content);
    
    if (agent.outputType === "JSON only") {
      return { app: { sections: [], markdown: "```json\n" + JSON.stringify(parsed, null, 2) + "\n```" } };
    }

    if (agent.outputType === "Cards only") {
      return { app: { sections: parsed.sections || parsed.app?.sections || [], markdown: "" } };
    }

    // Default: Cards + Markdown
    if (parsed.app) return parsed as AppSpec;
    if (parsed.cardStructure && parsed.markdownExport) {
      return { app: { sections: parsed.cardStructure, markdown: parsed.markdownExport } };
    }
    
    return {
      app: {
        sections: parsed.sections || [],
        markdown: parsed.markdown || ""
      }
    };
  } catch (e) {
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
    return { app: { sections: [], markdown: content } };
  }
}
