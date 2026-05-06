import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserContext } from '../types/buildFeed';

interface AuthContextType {
  user: User | null;
  profile: UserContext | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  acknowledgeVersion: (version: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create profile
        try {
          const profileRef = doc(db, 'profiles', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            setProfile(profileSnap.data() as UserContext);
          } else {
            // Create default profile
            const newProfile: UserContext = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Architect',
              role: firebaseUser.email === 'lacometta33@gmail.com' ? 'admin' : 'vibe_coder'
            };
            await setDoc(profileRef, {
              ...newProfile,
              email: firebaseUser.email,
              created_at: serverTimestamp(),
              updated_at: serverTimestamp()
            });
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error setting up user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const acknowledgeVersion = async (version: string) => {
    if (!profile) return;
    try {
      const newAck = [...(profile.acknowledged_versions || []), version];
      await updateDoc(doc(db, 'profiles', profile.id), {
        acknowledged_versions: newAck,
        updated_at: serverTimestamp()
      });
      setProfile({ ...profile, acknowledged_versions: newAck });
    } catch (error) {
      console.error("Error acknowledging version:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, acknowledgeVersion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
