import { useCallback } from "react";
import { Project, ImagePipeline } from "../types";
import { runScreenImagePipeline } from "../services/imagePipelineService";
import { getShortTime, getCurrentTimestamp } from "../utils/time";
import { apiRequest } from "../services/apiClient";

/**
 * Handles the use image pipeline workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function useImagePipeline(
  projects: Project[],
  setProjects: (p: Project[] | ((prev: Project[]) => Project[])) => void
) {
  const updateProjectPostgres = async (id: string, updates: Partial<Project>) => {
    await apiRequest('/api/workspace/projects/' + id, { method: 'PATCH', body: JSON.stringify({ data: { ...updates, updatedAt: new Date().toISOString() } }) });
    setProjects(prev => prev.map(project => project.id === id ? { ...project, ...updates, updatedAt: new Date().toISOString() } : project));
  };

  const getLatestProject = async (id: string) => projects.find(project => project.id === id) || null;

  const startImagePipeline = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const log = async (message: string) => {
      const latest = await getLatestProject(projectId);
      if (latest?.imagePipeline) {
        await updateProjectPostgres(projectId, {
          imagePipeline: {
            ...latest.imagePipeline,
            logs: [...latest.imagePipeline.logs, { timestamp: getShortTime(), step: "IMAGE-GEN", message }]
          }
        });
      }
    };

    const updateProgress = async (updates: Partial<Project>) => {
      await updateProjectPostgres(projectId, updates);
    };

    try {
      await runScreenImagePipeline({
        project,
        onProgress: updateProgress,
        onLog: log
      });
    } catch (e: any) {
      await log(`CRITICAL ERROR: ${e.message}`);
      const latest = await getLatestProject(projectId);
      if (latest?.imagePipeline) {
        await updateProjectPostgres(projectId, {
          imagePipeline: { ...latest.imagePipeline, status: "Failed" as const }
        });
      }
      throw e;
    }
  };

  const regenerateSingleImage = async (projectId: string, screenCode: string) => {
    // Similar logic can be implemented here if the service supports it
  };

  return { startImagePipeline, regenerateSingleImage };
}
