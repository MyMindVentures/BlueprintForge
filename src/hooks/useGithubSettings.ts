import { useState, useEffect } from 'react';
import { GithubSettings } from '../types/buildFeed';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from './useAuth';

export function useGithubSettings() {
  const { profile: currentUser } = useAuth();
  const [settings, setSettingsState] = useState<GithubSettings>({
    repo_url: '',
    repo_owner: '',
    repo_name: '',
    github_token: '',
    auto_create_issues: false,
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const unsub = onSnapshot(doc(db, 'github_settings', 'global'), (snap) => {
      if (snap.exists()) {
        setSettingsState(snap.data() as GithubSettings);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'github_settings/global'));

    return unsub;
  }, [currentUser]);

  const setSettings = async (newSettings: GithubSettings) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await setDoc(doc(db, 'github_settings', 'global'), {
        ...newSettings,
        updated_at: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'github_settings/global');
    }
  };

  return { settings, setSettings };
}
