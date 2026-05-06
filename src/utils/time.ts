export function formatTimestamp(date: string | null): string {
  if (!date) return "Never";
  return new Date(date).toLocaleString();
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function getShortTime(): string {
  return new Date().toLocaleTimeString();
}
