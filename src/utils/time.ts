/**
 * Handles the format timestamp workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function formatTimestamp(date: string | null): string {
  if (!date) return "Never";
  return new Date(date).toLocaleString();
}

/**
 * Handles the get current timestamp workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Handles the get short time workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function getShortTime(): string {
  return new Date().toLocaleTimeString();
}
