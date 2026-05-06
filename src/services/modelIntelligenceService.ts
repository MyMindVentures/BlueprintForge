import { OpenRouterModel } from "../types";
import { callOpenRouterChatCompletion } from "./openRouterClient";

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

Return JSON only:
{
  "description": "Short practical description.",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendedAgentTypes": [
    {
      "agentType": "Name",
      "reason": "Reason",
      "rating": 1
    }
  ]
}

Rules:
* Use ratings from 1 to 5
* Valid JSON only`;

  const userPrompt = `Model Metadata:
ID: ${targetModel.id}
Name: ${targetModel.name}
Context: ${targetModel.contextLength}
Pricing: ${JSON.stringify(targetModel.pricing)}
Capabilities: ${JSON.stringify(targetModel.capabilities)}`;

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

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid intelligence JSON.");
    return JSON.parse(jsonMatch[0]);
  }
}
