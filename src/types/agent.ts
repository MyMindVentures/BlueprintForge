/**
 * AI Agent Output types.
 */
export type AgentOutputType = "Cards + Markdown" | "Markdown only" | "JSON only" | "Cards only";

/**
 * AI Agent Status
 */
export type AgentStatus = "Draft" | "Active";

/**
 * AI Agent Configuration
 */
export interface AIAgent {
  id: string;
  code: string; // AGENT-01, etc.
  name: string;
  purpose: string;
  systemPrompt: string;
  outputRules: string;
  codeRules: string;
  formattingRules: string;
  validationRules: string;
  outputType: AgentOutputType;
  status: AgentStatus;
  isDefault: boolean;
  linkedCapabilityIds: string[];
  preferredModelId: string | null;
  temperature: number;
  maxOutputTokens: number;
  reasoningEffort: "low" | "medium" | "high" | null;
  createdAt: string;
  updatedAt: string;
}
