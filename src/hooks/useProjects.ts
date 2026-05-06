import { useCallback } from "react";
import { Project, AIAgent } from "../types";
import { apiRequest } from "../services/apiClient";

const userContext = (id: string) => ({ id, name: id, role: 'vibe_coder' as const });

export function useProjects(setProjects: (p: Project[] | ((prev: Project[]) => Project[])) => void, agents: AIAgent[], userId: string | undefined) {
  const addProject = useCallback(async () => {
    if (!userId) return;
    const defaultAgent = agents.find(a => a.isDefault) || agents[0];
    const now = new Date().toISOString();
    const data = { name: "New Project", status: "Draft", rawConcept: "", selectedAgentId: defaultAgent?.id || null, modelOverrideId: null, cardStructure: null, markdownExport: "", createdAt: now, updatedAt: now };
    const res = await apiRequest<{ id: string }>('/api/workspace/projects', { method: 'POST', user: userContext(userId), body: JSON.stringify({ data }) });
    return res.id;
  }, [agents, userId]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    await apiRequest('/api/workspace/projects/' + id, { method: 'PATCH', body: JSON.stringify({ data: { ...updates, updatedAt: new Date().toISOString() } }) });
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    if (!userId) return;
    await apiRequest('/api/workspace/projects/' + id, { method: 'DELETE', user: userContext(userId) });
  }, [userId]);

  const duplicateProject = useCallback(async (id: string, projects: Project[]) => {
    if (!userId) return;
    const source = projects.find(p => p.id === id);
    if (!source) return;
    const { id: _id, ...copy } = source;
    const res = await apiRequest<{ id: string }>('/api/workspace/projects', { method: 'POST', user: userContext(userId), body: JSON.stringify({ data: { ...copy, name: `${source.name} (Copy)`, updatedAt: new Date().toISOString() } }) });
    return res.id;
  }, [userId]);

  return { addProject, updateProject, deleteProject, duplicateProject };
}
