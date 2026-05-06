import { useState, useEffect } from 'react';
import { 
  collection, query, onSnapshot, addDoc, serverTimestamp, 
  orderBy, limit, doc, updateDoc, setDoc, getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { AppVersion, GuideSection, UserFlow, DemoRecording, DemoSession } from '../types/guide';
import { useAuth } from './useAuth';

/**
 * Handles the use guide workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function useGuide() {
  const { profile: currentUser } = useAuth();
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [flows, setFlows] = useState<UserFlow[]>([]);
  const [recordings, setRecordings] = useState<DemoRecording[]>([]);
  const [currentSession, setCurrentSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    const unsubVersions = onSnapshot(query(collection(db, 'app_versions'), orderBy('created_at', 'desc')), (snap) => {
      setVersions(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppVersion)));
    });

    const unsubFlows = onSnapshot(query(collection(db, 'user_flows'), orderBy('updated_at', 'desc')), (snap) => {
       setFlows(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserFlow)));
    });

    const unsubRecordings = onSnapshot(query(collection(db, 'demo_recordings'), orderBy('created_at', 'desc')), (snap) => {
       setRecordings(snap.docs.map(d => ({ id: d.id, ...d.data() } as DemoRecording)));
    });

    return () => {
      unsubVersions();
      unsubFlows();
      unsubRecordings();
    };
  }, []);

  const publishVersion = async (version: Omit<AppVersion, 'id' | 'created_at'>) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const versionDoc = await addDoc(collection(db, 'app_versions'), {
        ...version,
        created_by: currentUser.id,
        created_at: serverTimestamp()
      });

      // Notify all builders
      const buildersSnap = await getDocs(collection(db, 'vibe_coder_profiles'));
      const notifyPromises = buildersSnap.docs.map(builderDoc => 
        addDoc(collection(db, 'notifications'), {
          user_id: builderDoc.data().user_id,
          type: "version_deployed",
          title: `New version ${version.version} deployed`,
          message: version.release_notes || `Check out the new features in our latest update.`,
          link: "SCR-24", // Indicating changelog screen
          is_read: false,
          created_at: serverTimestamp()
        })
      );
      await Promise.all(notifyPromises);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'app_versions');
    }
  };

  const startDemoSession = async (selectedFlows: string[], record: boolean) => {
    if (!currentUser) return;
    try {
      const sessionRef = doc(collection(db, 'demo_sessions'));
      const session: DemoSession = {
        id: sessionRef.id,
        version: versions[0]?.version || '0.0.0',
        status: record ? 'recording' : 'running',
        selected_flows: selectedFlows,
        is_recording: record,
        created_by: currentUser.id,
        created_at: new Date().toISOString()
      };
      await setDoc(sessionRef, { ...session, created_at: serverTimestamp() });
      setCurrentSession(session);
      return session;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'demo_sessions');
    }
  };

  const completeDemoSession = async (recording?: Omit<DemoRecording, 'id' | 'created_at'>) => {
    if (!currentSession || !currentUser) return;
    
    try {
      if (recording) {
        await addDoc(collection(db, 'demo_recordings'), {
          ...recording,
          demo_session_id: currentSession.id,
          created_at: serverTimestamp(),
          created_by: currentUser.id
        });
      }

      await updateDoc(doc(db, 'demo_sessions', currentSession.id), {
        status: 'completed',
        completed_at: serverTimestamp()
      });
      
      setCurrentSession(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `demo_sessions/${currentSession.id}`);
    }
  };

  return {
    latestVersion: versions[0],
    versions,
    flows,
    recordings,
    currentSession,
    publishVersion,
    startDemoSession,
    completeDemoSession,
    setCurrentSession
  };
}
