import { 
  collection, query, onSnapshot, addDoc, updateDoc, doc, 
  orderBy, limit, serverTimestamp, runTransaction, getDoc
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { BuildRequest, BuildRequestUpdate, VibeCoderProfile, BuilderStarEvent, DailySignal } from '../types/buildFeed';

export const buildFeedService = {
  subscribeToRequests: (callback: (requests: BuildRequest[]) => void) => {
    const q = query(collection(db, 'build_requests'), orderBy('created_at', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuildRequest));
      callback(requests);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'build_requests'));
  },

  subscribeToDailySignals: (callback: (signals: DailySignal[]) => void) => {
    const q = query(collection(db, 'daily_signals'), orderBy('created_at', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const signals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailySignal));
      callback(signals);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'daily_signals'));
  },

  subscribeToProfiles: (callback: (profiles: VibeCoderProfile[]) => void) => {
    const q = collection(db, 'vibe_coder_profiles');
    return onSnapshot(q, (snapshot) => {
      const profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VibeCoderProfile));
      callback(profiles);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'vibe_coder_profiles'));
  },

  publishRequest: async (request: Partial<BuildRequest>, userId: string) => {
    try {
      const docRef = await addDoc(collection(db, 'build_requests'), {
        ...request,
        status: 'Open',
        created_by: userId,
        claimed_by: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, 'build_requests');
    }
  },

  claimTicket: async (requestId: string, userId: string, profileId: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const ticketRef = doc(db, 'build_requests', requestId);
        const ticketSnap = await transaction.get(ticketRef);
        
        if (!ticketSnap.exists()) throw new Error("Ticket does not exist");
        if (ticketSnap.data().status !== 'Open') throw new Error("Ticket already claimed");

        transaction.update(ticketRef, {
          status: 'Claimed',
          claimed_by: userId,
          claimed_by_profile_id: profileId,
          claimed_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });

        const updateRef = doc(collection(db, 'build_request_updates'));
        transaction.set(updateRef, {
          build_request_id: requestId,
          user_id: userId,
          profile_id: profileId,
          update_text: "Ticket claimed by builder.",
          created_at: serverTimestamp()
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `build_requests/${requestId}`);
    }
  },

  awardStar: async (profileId: string, requestId: string, adminId: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const profileRef = doc(db, 'vibe_coder_profiles', profileId);
        const eventQuery = query(collection(db, 'builder_star_events'));
        // NOTE: Standard Firestore rules handle simple existence checks, but transactions ensure atomicity.
        
        const profileSnap = await transaction.get(profileRef);
        if (!profileSnap.exists()) throw new Error("Profile not found");

        const stars = (profileSnap.data().stars_count || 0) + 1;
        transaction.update(profileRef, {
          stars_count: stars,
          updated_at: serverTimestamp()
        });

        const eventRef = doc(collection(db, 'builder_star_events'));
        transaction.set(eventRef, {
          profile_id: profileId,
          build_request_id: requestId,
          awarded_by: adminId,
          reason: "Completed Feed Request",
          created_at: serverTimestamp()
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vibe_coder_profiles/${profileId}`);
    }
  }
};
