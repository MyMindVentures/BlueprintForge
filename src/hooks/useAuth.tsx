import React, { useState, useEffect, createContext, useContext } from 'react';
import { browserLocalPersistence, onAuthStateChanged, setPersistence, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserContext } from '../types/buildFeed';
import { apiRequest } from '../services/apiClient';
import { logAdminAccessDebug, normalizeRole } from '../authRoles';

interface AuthContextType {
  user: User | null;
  profile: UserContext | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  acknowledgeVersion: (version: string) => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    void setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Firebase auth persistence setup failed:', error);
      setAuthError('Firebase auth persistence could not be initialized. Refresh may require signing in again.');
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthError(null);
      logAdminAccessDebug('auth-state-changed', {
        signedIn: Boolean(firebaseUser),
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        providerIds: firebaseUser?.providerData.map((provider) => provider.providerId)
      });
      if (firebaseUser) {
        try {
          const postgresProfile = await apiRequest<UserContext>('/api/auth/firebase-profile', {
            method: 'POST',
            body: JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName })
          });
          const normalizedProfile = { ...postgresProfile, role: normalizeRole(postgresProfile.role) as UserContext['role'] };
          logAdminAccessDebug('role-resolved', {
            uid: firebaseUser.uid,
            profileId: normalizedProfile.id,
            resolvedRole: normalizedProfile.role,
            rawRole: postgresProfile.role,
            roleResolution: (postgresProfile as any).role_resolution
          });
          setProfile(normalizedProfile);
        } catch (error) {
          console.error('Error setting up PostgreSQL user profile:', error);
          setAuthError(error instanceof Error ? error.message : 'errors.profileSetupFailed');
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

  return <AuthContext.Provider value={{ user, profile, loading, signIn, logout, acknowledgeVersion, authError }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
