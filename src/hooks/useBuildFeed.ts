import { useState, useEffect } from 'react';
import { 
  BuildRequest, 
  BuildRequestUpdate, 
  VibeCoderProfile, 
  BuilderStarEvent, 
  DailySignal 
} from '../types/buildFeed';
import { buildFeedService } from '../services/buildFeedService';
import { useAuth } from './useAuth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';

export function useBuildFeed() {
  const { profile: currentUser } = useAuth();
  
  const [requests, setRequests] = useState<BuildRequest[]>([]);
  const [updates, setUpdates] = useState<BuildRequestUpdate[]>([]);
  const [profiles, setProfiles] = useState<VibeCoderProfile[]>([]);
  const [dailySignals, setDailySignals] = useState<DailySignal[]>([]);
  const [lastNotification, setLastNotification] = useState<BuildRequest | null>(null);

  const currentUserProfile = profiles.find(p => p.user_id === currentUser?.id);

  useEffect(() => {
    const unsubRequests = buildFeedService.subscribeToRequests(setRequests);
    const unsubSignals = buildFeedService.subscribeToDailySignals(setDailySignals);
    const unsubProfiles = buildFeedService.subscribeToProfiles(setProfiles);

    // Updates listener
    const qUpdates = collection(db, 'build_request_updates');
    const unsubUpdates = onSnapshot(qUpdates, (snap) => {
      setUpdates(snap.docs.map(d => ({ id: d.id, ...d.data() } as BuildRequestUpdate)));
    });

    return () => {
      unsubRequests();
      unsubSignals();
      unsubProfiles();
      unsubUpdates();
    };
  }, []);

  const publishRequest = async (request: any) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    return await buildFeedService.publishRequest(request, currentUser.id);
  };

  const updateRequest = async (id: string, updates: Partial<BuildRequest>) => {
    try {
      await updateDoc(doc(db, 'build_requests', id), {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `build_requests/${id}`);
    }
  };

  const claimRequest = async (id: string) => {
    if (!currentUser || !currentUserProfile) return;
    await buildFeedService.claimTicket(id, currentUser.id, currentUserProfile.id);
  };

  const postUpdate = async (build_request_id: string, update_text: string) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'build_request_updates'), {
        build_request_id,
        user_id: currentUser.id,
        profile_id: currentUserProfile?.id || null,
        update_text,
        created_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'build_request_updates');
    }
  };

  const saveProfile = async (profileData: Partial<VibeCoderProfile>) => {
    if (!currentUser) return;
    try {
      if (currentUserProfile) {
        await updateDoc(doc(db, 'vibe_coder_profiles', currentUserProfile.id), {
          ...profileData,
          updated_at: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'vibe_coder_profiles'), {
          ...profileData,
          user_id: currentUser.id,
          stars_count: 0,
          completed_requests_count: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          status: 'Active Builder'
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'vibe_coder_profiles');
    }
  };

  const awardStar = async (profileId: string, buildRequestId: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    await buildFeedService.awardStar(profileId, buildRequestId, currentUser.id);
  };

  const postDailySignal = async (message: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await addDoc(collection(db, 'daily_signals'), {
        message,
        created_by: currentUser.id,
        created_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'daily_signals');
    }
  };

  const updateRequestStatus = async (id: string, status: BuildRequest["status"]) => {
    await updateRequest(id, { status });
  };

  const verifyProfile = async (profileId: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await updateDoc(doc(db, 'vibe_coder_profiles', profileId), {
        status: 'Verified Builder',
        updated_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `vibe_coder_profiles/${profileId}`);
    }
  };

  const toggleFocus = async (id: string, reason?: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    const request = requests.find(r => r.id === id);
    if (!request) return;

    const currentlyFocused = requests.filter(r => r.is_current_focus).length;
    const isEnabling = !request.is_current_focus;

    if (isEnabling && currentlyFocused >= 3) {
      throw new Error("Maximum 3 focus requests allowed.");
    }

    try {
      await updateDoc(doc(db, 'build_requests', id), {
        is_current_focus: isEnabling,
        focus_reason: isEnabling ? (reason || null) : null,
        focus_set_at: isEnabling ? serverTimestamp() : null,
        focus_order: isEnabling ? currentlyFocused + 1 : null,
        updated_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `build_requests/${id}`);
    }
  };

  return {
    requests,
    updates,
    profiles,
    currentUser,
    currentUserProfile,
    publishRequest,
    updateRequest,
    claimRequest,
    updateRequestStatus,
    postUpdate,
    saveProfile,
    verifyProfile,
    awardStar,
    toggleFocus,
    postDailySignal,
    dailySignals,
    lastNotification
  };
}
