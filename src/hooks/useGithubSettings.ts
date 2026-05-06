import { useState, useEffect } from 'react';
import { GithubSettings } from '../types/buildFeed';
import { useAuth } from './useAuth';
import { apiRequest, pollingIntervalMs } from '../services/apiClient';

export function useGithubSettings() {
  const { profile: currentUser } = useAuth();
  const [settings, setSettingsState] = useState<GithubSettings>({ repo_url: '', repo_owner: '', repo_name: '', github_token: '', auto_create_issues: false });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;
    let active = true;
    const load = async () => {
      try { const data = await apiRequest<Partial<GithubSettings>>('/api/github-settings', { user: currentUser }); if (active) setSettingsState(prev => ({ ...prev, ...data })); }
      catch (error) { console.error('GitHub settings polling failed:', error); }
    };
    load();
    const interval = window.setInterval(load, pollingIntervalMs);
    return () => { active = false; window.clearInterval(interval); };
  }, [currentUser]);

  const setSettings = async (newSettings: GithubSettings) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    await apiRequest('/api/github-settings', { method: 'PATCH', user: currentUser, body: JSON.stringify({ data: newSettings }) });
    setSettingsState(newSettings);
  };

  return { settings, setSettings };
}
