import { useCallback } from "react";
import { AIAgent } from "../types";
import { DEFAULT_AGENTS } from "../constants";
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where, getDocs 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../services/firebase";

export function useAgents(userId: string | undefined) {
  const addAgent = useCallback(async () => {
    if (!userId) return;
    const template = DEFAULT_AGENTS[0];
    const newAgentData: any = {
      ...template,
      code: `CUSTOM-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: "New Custom Agent",
      status: "Draft",
      isDefault: false,
      user_id: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };
    delete newAgentData.id;

    try {
      const docRef = await addDoc(collection(db, 'agents'), newAgentData);
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'agents');
    }
  }, [userId]);

  const updateAgent = useCallback(async (id: string, updates: Partial<AIAgent>, allAgents: AIAgent[]) => {
    try {
      // If setting as default, unset others first or handle in transaction
      if (updates.isDefault) {
        for (const a of allAgents) {
          if (a.id !== id && a.isDefault) {
            await updateDoc(doc(db, 'agents', a.id), { isDefault: false });
          }
        }
      }

      await updateDoc(doc(db, 'agents', id), {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `agents/${id}`);
    }
  }, []);

  const deleteAgent = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'agents', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `agents/${id}`);
    }
  }, []);

  const duplicateAgent = async (id: string, allAgents: AIAgent[]) => {
    if (!userId) return;
    const source = allAgents.find(a => a.id === id);
    if (!source) return;

    try {
      const newAgentData: any = {
        ...source,
        name: `${source.name} (Copy)`,
        isDefault: false,
        status: "Draft",
        user_id: userId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      delete newAgentData.id;
      const docRef = await addDoc(collection(db, 'agents'), newAgentData);
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'agents');
    }
  };

  return { addAgent, updateAgent, deleteAgent, duplicateAgent };
}
