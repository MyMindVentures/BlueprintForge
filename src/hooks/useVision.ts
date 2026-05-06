import { useState, useEffect } from 'react';
import { 
  collection, query, onSnapshot, addDoc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { FounderVision } from '../types/vision';
import { useAuth } from './useAuth';

/**
 * Handles the use vision workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function useVision() {
  const [visions, setVisions] = useState<FounderVision[]>([]);
  const { profile: currentUser } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'founder_visions'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVisions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FounderVision)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'founder_visions'));

    return unsubscribe;
  }, []);

  const publishVision = async (vision: Omit<FounderVision, 'id' | 'created_at'>) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const docRef = await addDoc(collection(db, 'founder_visions'), {
        ...vision,
        created_by: currentUser.id,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...vision };
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'founder_visions');
    }
  };

  return {
    visions,
    publishVision
  };
}
