import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Firebase remains temporarily for authentication only. Firestore is no longer
// the primary persistence layer; application data is stored in PostgreSQL.
export const auth = getAuth(app);
