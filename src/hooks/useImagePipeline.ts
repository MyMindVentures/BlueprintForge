import { useCallback } from "react";
import { Project, ImagePipeline } from "../types";
import { runScreenImagePipeline } from "../services/imagePipelineService";
import { getShortTime, getCurrentTimestamp } from "../utils/time";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../services/firebase";

/**
 * Handles the use image pipeline workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function useImagePipeline(
  projects: Project[],
  setProjects: (p: Project[] | ((prev: Project[]) => Project[])) => void
) {
  const updateProjectFirebase = async (id: string, updates: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', id), {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `projects/${id}`);
    }
  };

  const getLatestProject = async (id: string) => {
    const snap = await getDoc(doc(db, 'projects', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } as Project : null;
  };

  const startImagePipeline = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const log = async (message: string) => {
      const latest = await getLatestProject(projectId);
      if (latest?.imagePipeline) {
        await updateProjectFirebase(projectId, {
          imagePipeline: {
            ...latest.imagePipeline,
            logs: [...latest.imagePipeline.logs, { timestamp: getShortTime(), step: "IMAGE-GEN", message }]
          }
        });
      }
    };

    const updateProgress = async (updates: Partial<Project>) => {
      await updateProjectFirebase(projectId, updates);
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
        await updateProjectFirebase(projectId, {
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
