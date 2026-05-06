import { useCallback } from "react";
import { Project, AIAgent } from "../types";
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../services/firebase";

export function useProjects(
  setProjects: (p: Project[] | ((prev: Project[]) => Project[])) => void, 
  agents: AIAgent[],
  userId: string | undefined
) {
  const addProject = useCallback(async () => {
    if (!userId) return;
    const defaultAgent = agents.find(a => a.isDefault) || agents[0];
    const newProjectData: any = {
      name: "New Project",
      status: "Draft",
      rawConcept: "",
      selectedAgentId: defaultAgent?.id || null,
      modelOverrideId: null,
      cardStructure: null,
      markdownExport: "",
      user_id: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'projects'), newProjectData);
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'projects');
    }
  }, [agents, userId]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', id), {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `projects/${id}`);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `projects/${id}`);
    }
  }, []);

  const duplicateProject = useCallback(async (id: string, projects: Project[]) => {
    if (!userId) return;
    const source = projects.find(p => p.id === id);
    if (!source) return;

    try {
      const newProjectData: any = {
        ...source,
        name: `${source.name} (Copy)`,
        user_id: userId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      delete newProjectData.id;
      const docRef = await addDoc(collection(db, 'projects'), newProjectData);
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'projects');
    }
  }, [userId]);

  return { addProject, updateProject, deleteProject, duplicateProject };
}
