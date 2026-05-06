import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from './useAuth';
import { AppNotification } from '../types/buildFeed';

/**
 * Handles the use notifications workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function useNotifications() {
  const { profile: currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    
    const unsubs = onSnapshot(
      query(collection(db, 'notifications'), where('user_id', '==', currentUser.id), orderBy('created_at', 'desc')),
      (snap) => {
        setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      }
    );

    return () => unsubs();
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'notifications', id), { is_read: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const createNotification = async (notification: Omit<AppNotification, 'id' | 'created_at'>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        created_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'notifications');
    }
  };

  return { notifications, markAsRead, createNotification };
}
