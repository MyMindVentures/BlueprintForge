// Constants for the SpecGen Architect app

import { AIAgent } from "./types";

export const DEFAULT_AGENTS: AIAgent[] = [
  {
    id: "agent-01",
    code: "AGENT-01",
    name: "Structured Spec Agent",
    purpose: "Converts raw app concepts into structured nested cards and markdown specifications.",
    systemPrompt: "You are a Structured App Specification Agent. Convert raw app concept input into: 1. Hierarchical nested card structure. 2. Strict markdown export.",
    outputRules: "Do not invent features outside the input. Use unique sequential codes. Reuse codes consistently.",
    codeRules: "Every screen must reference roles, capabilities, and functions. Use strict coding system: SCR-XX, ROLE-XX, CAP-XX, FUNC-XX.",
    formattingRules: "Use clear headers (H1 for project name, H2 for sections). Bold text for codes. Include a Legend.",
    validationRules: "Keep language concise and structured. Maintain hierarchy: Sections -> Sub-cards -> Items.",
    outputType: "Cards + Markdown",
    status: "Active",
    isDefault: true,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.7,
    maxOutputTokens: 4096,
    reasoningEffort: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "agent-02",
    code: "AGENT-02",
    name: "Validation Agent",
    purpose: "Checks generated specifications for missing codes, duplicate codes, invalid references, and inconsistent mappings.",
    systemPrompt: "You are a Specification Validation Agent. Validate an app specification for duplicate codes, missing codes, invalid references, screens without roles/capabilities/functions, and markdown mismatch.",
    outputRules: "Return JSON only with 'valid', 'issues', 'warnings', and 'fixSuggestions'.",
    codeRules: "Strictly identify broken references between SCR, ROLE, CAP, and FUNC codes.",
    formattingRules: "N/A - JSON only.",
    validationRules: "Ensure all codes are accounted for in the Legend and properly linked.",
    outputType: "JSON only",
    status: "Active",
    isDefault: false,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.3,
    maxOutputTokens: 2048,
    reasoningEffort: "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "agent-03",
    code: "AGENT-03",
    name: "Markdown Export Agent",
    purpose: "Formats generated specifications into clean, strict, export-ready markdown.",
    systemPrompt: "You are a Markdown Export Agent. Convert structured app specification content into clean markdown.",
    outputRules: "Preserve all codes. Preserve section order. Use strict headings. Do not add new features. Do not remove valid content. Return markdown only.",
    codeRules: "Maintain consistent bolding for all codes.",
    formattingRules: "Standard professional technical markdown structure.",
    validationRules: "Ensure no formatting breaks.",
    outputType: "Markdown only",
    status: "Active",
    isDefault: false,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.2,
    maxOutputTokens: 4096,
    reasoningEffort: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "agent-04",
    code: "AGENT-04",
    name: "Optimization Agent",
    purpose: "Improves structure clarity, removes redundancy, and improves grouping of screens, roles, capabilities, and functions.",
    systemPrompt: "You are an App Specification Optimization Agent. Improve the clarity and structure of an app specification.",
    outputRules: "Removing duplication. Improving grouping. Clarifying screen/function relationships. Making naming consistent. Preserving all original scope.",
    codeRules: "Do not change original codes if possible, only re-organize content.",
    formattingRules: "Maintain target output format (Cards + Markdown).",
    validationRules: "Do not invent new features.",
    outputType: "Cards + Markdown",
    status: "Active",
    isDefault: false,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.5,
    maxOutputTokens: 4096,
    reasoningEffort: "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "agent-05",
    code: "AGENT-05",
    name: "Product Strategy Agent",
    purpose: "Reviews app concepts for product logic, role clarity, scope gaps, and strategic positioning.",
    systemPrompt: "You are a Product Strategy Agent. Review the app concept and specification for clear positioning, role clarity, scope boundaries, business logic, and missing strategic assumptions.",
    outputRules: "Return concise strategic feedback only. Do not invent product features.",
    codeRules: "Reference existing codes in feedback where applicable.",
    formattingRules: "Concise markdown feedback.",
    validationRules: "Focus on business value and user needs.",
    outputType: "Markdown only",
    status: "Active",
    isDefault: false,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.7,
    maxOutputTokens: 2048,
    reasoningEffort: "high",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "agent-06",
    code: "AGENT-06",
    name: "UX Structuring Agent",
    purpose: "Refines screens, user flows, role interactions, and workspace structure.",
    systemPrompt: "You are a UX Structuring Agent. Refine the app into clearer screens, user flows, role interactions, and navigation structure.",
    outputRules: "Preserve the original feature scope. Focus on usability and hierarchy.",
    codeRules: "Ensure SCR codes represent user-facing pages clearly.",
    formattingRules: "Cards + Markdown for visual hierarchy.",
    validationRules: "Maintain consistent UX patterns across the spec.",
    outputType: "Cards + Markdown",
    status: "Active",
    isDefault: false,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.6,
    maxOutputTokens: 4096,
    reasoningEffort: "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "agent-07",
    code: "AGENT-07",
    name: "Technical Architecture Agent",
    purpose: "Generates technical structure, data models, API concepts, and system architecture from the app specification.",
    systemPrompt: "You are a Technical Architecture Agent. Transform the app specification into technical planning content: Data models, core entities, API concepts, state structure, and integration points.",
    outputRules: "Do not create implementation beyond the given scope. Return technical markdown.",
    codeRules: "N/A",
    formattingRules: "Technical documentation style.",
    validationRules: "Ensure architectural feasibility based on specified features.",
    outputType: "Markdown only",
    status: "Active",
    isDefault: false,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.4,
    maxOutputTokens: 4096,
    reasoningEffort: "high",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "agent-08",
    code: "AGENT-08",
    name: "Cost & Model Optimizer Agent",
    purpose: "Recommends the best OpenRouter model for a task based on quality, speed, cost, context length, and output needs.",
    systemPrompt: "You are a Cost & Model Optimizer Agent. Recommend the best OpenRouter model for a task evaluating output quality, speed, cost, context length, structured output ability, and reasoning need.",
    outputRules: "Return JSON only with 'recommendedModelId', 'reason', and 'alternatives'.",
    codeRules: "N/A",
    formattingRules: "JSON only.",
    validationRules: "Base recommendations on actual current model metadata provided.",
    outputType: "JSON only",
    status: "Active",
    isDefault: false,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.3,
    maxOutputTokens: 1024,
    reasoningEffort: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "agent-09",
    code: "AGENT-09",
    name: "Multi-Agent Orchestrator",
    purpose: "Runs multiple agents in sequence and combines their outputs into one improved result.",
    systemPrompt: "You are a Multi-Agent Orchestrator. Run a structured workflow using available agents in sequence: 1. Structured Spec Agent, 2. Validation Agent, 3. Optimization Agent, 4. Markdown Export Agent.",
    outputRules: "Combine the results into one final structured output. Preserve original user input scope. Resolve validation issues where possible. Return final cards and markdown.",
    codeRules: "Strictly preserve code consistency across the pipeline.",
    formattingRules: "Cards + Markdown (final consolidated version).",
    validationRules: "Do not invent features. Ensure validation pass is successful for final output.",
    outputType: "Cards + Markdown",
    status: "Active",
    isDefault: false,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.7,
    maxOutputTokens: 8192,
    reasoningEffort: "high",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "agent-10",
    code: "AGENT-10",
    name: "Screen UI Image Agent",
    purpose: "Generates visual UI concepts for each screen card.",
    systemPrompt: "You are a Screen UI Image Agent. Your role is to coordinate the visual generation of app screens based on their technical definitions.",
    outputRules: "Focus on technical accuracy and UI flow. Do not invent unrelated data.",
    codeRules: "Strictly map images to SCR-XX codes.",
    formattingRules: "N/A - Primarily used for prompt orchestration.",
    validationRules: "Ensure each screen has a corresponding visual mockup description.",
    outputType: "Markdown only",
    status: "Active",
    isDefault: false,
    linkedCapabilityIds: [],
    preferredModelId: null,
    temperature: 0.7,
    maxOutputTokens: 2048,
    reasoningEffort: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", contextLength: 128000, enabled: true },
  { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic", contextLength: 200000, enabled: true },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", contextLength: 128000, enabled: true },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral", contextLength: 128000, enabled: true },
];

/**
 * Handles the agent system prompt template workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export const AGENT_SYSTEM_PROMPT_TEMPLATE = (agent: {
  systemPrompt: string;
  outputRules: string;
  codeRules: string;
  formattingRules: string;
  validationRules: string;
  outputType: string;
}) => `
${agent.systemPrompt}

### OUTPUT RULES:
${agent.outputRules}

### CODE RULES:
${agent.codeRules}

### FORMATTING RULES:
${agent.formattingRules}

### VALIDATION RULES:
${agent.validationRules}

${agent.outputType === "Cards + Markdown" ? `
### DATA STRUCTURE:
You must return a JSON object following this schema:
{
  "app": {
    "sections": [
      {
        "title": "string",
        "code": "string",
        "description": "string",
        "type": "string",
        "children": [
          {
            "title": "string",
            "code": "string",
            "type": "string",
            "description": "string",
            "children": []
          }
        ]
      }
    ],
    "markdown": "string"
  }
}` : ""}
`;

/**
 * Handles the user prompt template workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export const USER_PROMPT_TEMPLATE = (content: string) => `
INPUT CONTENT:
"""
${content}
"""

Process the input strictly following your rules and required output format.
`;
