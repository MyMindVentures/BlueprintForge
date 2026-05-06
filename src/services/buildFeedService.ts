import { 
  collection, query, onSnapshot, addDoc, updateDoc, doc, 
  orderBy, limit, serverTimestamp, runTransaction, getDoc
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { BuildRequest, BuildRequestUpdate, VibeCoderProfile, BuilderStarEvent, DailySignal } from '../types/buildFeed';

/**
 * Provides the Firestore-backed Live Build Feed API for requests, profiles, signals and stars.
 * Used by founder/admin and builder flows and every method persists or streams shared platform state.
 */
export const buildFeedService = {
  /** Streams build requests so feeds show live status, claim and review changes. */
  subscribeToRequests: (callback: (requests: BuildRequest[]) => void) => {
    const q = query(collection(db, 'build_requests'), orderBy('created_at', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuildRequest));
      callback(requests);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'build_requests'));
  },

  /** Streams founder Daily Signals shown to builders and observers. */
  subscribeToDailySignals: (callback: (signals: DailySignal[]) => void) => {
    const q = query(collection(db, 'daily_signals'), orderBy('created_at', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const signals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailySignal));
      callback(signals);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'daily_signals'));
  },

  /** Streams builder profiles for directory, eligibility and reputation displays. */
  subscribeToProfiles: (callback: (profiles: VibeCoderProfile[]) => void) => {
    const q = collection(db, 'vibe_coder_profiles');
    return onSnapshot(q, (snapshot) => {
      const profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VibeCoderProfile));
      callback(profiles);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'vibe_coder_profiles'));
  },

  /** Publishes a reviewed founder draft as an Open build request persisted in Firestore. */
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

  /** Atomically claims an Open request for one builder and records the claim in the update stream. */
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

  /** Awards reputation after founder/admin acceptance and persists a star event atomically. */
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
