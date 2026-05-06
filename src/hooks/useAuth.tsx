import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserContext } from '../types/buildFeed';
import { apiRequest } from '../services/apiClient';

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
        try {
          const postgresProfile = await apiRequest<UserContext>('/api/auth/firebase-profile', {
            method: 'POST',
            body: JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName })
          });
          setProfile(postgresProfile);
        } catch (error) {
          console.error('Error setting up PostgreSQL user profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => signInWithPopup(auth, new GoogleAuthProvider()).then(() => undefined);
  const logout = async () => signOut(auth);
  const acknowledgeVersion = async (version: string) => {
    if (!profile) return;
    const updated = await apiRequest<UserContext>('/api/auth/acknowledge-version', { method: 'POST', user: profile, body: JSON.stringify({ version }) });
    setProfile(updated);
  };

  return <AuthContext.Provider value={{ user, profile, loading, signIn, logout, acknowledgeVersion }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
