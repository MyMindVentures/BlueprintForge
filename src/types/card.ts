/**
 * Describes the hierarchical structure of a card in the app specification.
 */
export type CardNodeType = "section" | "screen" | "role" | "capability" | "function" | "legend" | "item";

export interface CardNode {
  id: string;
  code: string; // SCR-01, ROLE-01, CAP-01, FUNC-01, etc.
  title: string;
  type: CardNodeType;
  description: string;
  children: CardNode[];
}

/**
 * The full application specification structure returned by the AI.
 */
export interface AppSpec {
  app: {
    sections: CardNode[];
    markdown: string;
  };
}
