export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(data: any): string {
  try {
    return JSON.stringify(data);
  } catch {
    return "";
  }
}
