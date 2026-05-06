export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Handles the safe json stringify workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function safeJsonStringify(data: any): string {
  try {
    return JSON.stringify(data);
  } catch {
    return "";
  }
}
