import { callOpenRouterChatCompletion } from './openRouterClient';

export class AIService {
  private apiKey: string;
  private model: string;
  private backendLogEndpoint: string = '/api/log';

  constructor(apiKey: string, model: string = 'openai/gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async logErrorToServer(errorType: string, errorDetail: any) {
    try {
      if (typeof window !== 'undefined') {
        const payload = {
          type: errorType,
          detail: errorDetail,
          timestamp: new Date().toISOString()
        };
        console.error(`[SERVER-SIDE LOG ATTEMPT] ${errorType}:`, errorDetail);
        // If we had a dedicated log endpoint it would go here. For now we will just console.error
        // await fetch(this.backendLogEndpoint, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload)
        // });
      }
    } catch (e) {
      console.warn("Could not log error to server", e);
    }
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      return await callOpenRouterChatCompletion({
        apiKey: this.apiKey,
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });
    } catch (e: any) {
      await this.logErrorToServer('generateTextError', e.message);
      throw new Error(`AI text generation failed: ${e.message}`);
    }
  }

  async generateJson<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const enforcedPrompt = `${systemPrompt}\n\nReturn valid JSON only. Do not wrap in markdown blocks.`;
    try {
      const rawRes = await callOpenRouterChatCompletion({
        apiKey: this.apiKey,
        model: this.model,
        messages: [
          { role: 'system', content: enforcedPrompt },
          { role: 'user', content: userPrompt }
        ],
        responseFormat: { type: "json_object" }
      });
      
      const jsonMatch = rawRes.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : rawRes;
      return JSON.parse(jsonString) as T;
    } catch (e: any) {
      await this.logErrorToServer('generateJsonError', e.message);
      // Attempt to fallback if something breaks
      throw new Error(`Failed to parse AI response into valid JSON. Try again.`);
    }
  }

  async polishTicket(rawInput: string) {
    const prompt = `You are the BlueprintForge AI architect assistant.
    Turn the following raw founder thought into a structured technical build ticket.
    
    OUTPUT JSON FORMAT:
    {
      "title": "Short descriptive title",
      "problem": "The 'Why' and context behind the request",
      "goal": "The high level goal of this ticket",
      "expected_behavior": "A technical description of WHAT needs to be built",
      "ui_ux_requirements": "UI/UX requirements or expectations",
      "technical_notes": "Implementation details or constraints",
      "acceptance_criteria": ["Criteria 1", "Criteria 2"],
      "priority": "Low | Medium | High | Critical",
      "difficulty": "Easy | Medium | Hard",
      "type": "App Improvement | New App Concept | UI Upgrade | Bug Fix | Growth Idea | Showcase"
    }
    
    Keep it high-signal and technical. No fluff.`;
    return this.generateJson<any>(prompt, rawInput);
  }

  async polishVision(rawVision: string): Promise<string> {
    return this.generateText("Polish this founder vision into a compelling narrative.", rawVision);
  }

  async generateAppConcept(idea: string): Promise<string> {
    return this.generateText("Generate a comprehensive app concept.", idea);
  }

  async refreshGuide(): Promise<string> {
    return this.generateText("Refresh our project guide with latest standard practices.", "Refresh guide");
  }
}
