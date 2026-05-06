import { useCallback } from "react";
import { AIAgent } from "../types";
import { DEFAULT_AGENTS } from "../constants";
import { apiRequest } from "../services/apiClient";
const userContext = (id: string) => ({ id, name: id, role: 'vibe_coder' as const });

export function useAgents(userId: string | undefined) {
  const addAgent = useCallback(async () => {
    if (!userId) return;
    const { id: _id, ...template } = DEFAULT_AGENTS[0];
    const data = { ...template, code: `CUSTOM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, name: "New Custom Agent", status: "Draft", isDefault: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const res = await apiRequest<{ id: string }>('/api/workspace/agents', { method: 'POST', user: userContext(userId), body: JSON.stringify({ data }) });
    return res.id;
  }, [userId]);

  const updateAgent = useCallback(async (id: string, updates: Partial<AIAgent>, allAgents: AIAgent[]) => {
    if (updates.isDefault) await Promise.all(allAgents.filter(a => a.id !== id && a.isDefault).map(a => apiRequest('/api/workspace/agents/' + a.id, { method: 'PATCH', body: JSON.stringify({ data: { isDefault: false, updatedAt: new Date().toISOString() } }) })));
    await apiRequest('/api/workspace/agents/' + id, { method: 'PATCH', body: JSON.stringify({ data: { ...updates, updatedAt: new Date().toISOString() } }) });
  }, []);

  const deleteAgent = useCallback(async (id: string) => {
    if (!userId) return;
    await apiRequest('/api/workspace/agents/' + id, { method: 'DELETE', user: userContext(userId) });
  }, [userId]);

  const duplicateAgent = async (id: string, allAgents: AIAgent[]) => {
    if (!userId) return;
    const source = allAgents.find(a => a.id === id);
    if (!source) return;
    const { id: _id, ...copy } = source;
    const res = await apiRequest<{ id: string }>('/api/workspace/agents', { method: 'POST', user: userContext(userId), body: JSON.stringify({ data: { ...copy, name: `${source.name} (Copy)`, isDefault: false, status: "Draft", updatedAt: new Date().toISOString() } }) });
    return res.id;
  };
  return { addAgent, updateAgent, deleteAgent, duplicateAgent };
}
