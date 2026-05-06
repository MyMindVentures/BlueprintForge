import { useState, useEffect } from 'react';
import { AppVersion, UserFlow, DemoRecording, DemoSession } from '../types/guide';
import { useAuth } from './useAuth';
import { apiRequest, pollingIntervalMs } from '../services/apiClient';

export function useGuide() {
  const { profile: currentUser } = useAuth();
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [flows, setFlows] = useState<UserFlow[]>([]);
  const [recordings, setRecordings] = useState<DemoRecording[]>([]);
  const [currentSession, setCurrentSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await apiRequest<{ versions: AppVersion[]; flows: UserFlow[]; recordings: DemoRecording[] }>('/api/guide');
        if (active) { setVersions(data.versions); setFlows(data.flows); setRecordings(data.recordings); }
      } catch (error) { console.error('Guide polling failed:', error); }
    };
    load();
    const interval = window.setInterval(load, pollingIntervalMs);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const publishVersion = async (version: Omit<AppVersion, 'id' | 'created_at'>) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    await apiRequest('/api/guide/versions', { method: 'POST', user: currentUser, body: JSON.stringify({ version }) });
  };

  const startDemoSession = async (selectedFlows: string[], record: boolean) => {
    if (!currentUser) return;
    const session = await apiRequest<DemoSession>('/api/guide/demo-sessions', {
      method: 'POST', user: currentUser,
      body: JSON.stringify({ session: { version: versions[0]?.version || '0.0.0', status: record ? 'recording' : 'running', selected_flows: selectedFlows, is_recording: record } })
    });
    setCurrentSession(session);
    return session;
  };

  const completeDemoSession = async (recording?: Omit<DemoRecording, 'id' | 'created_at'>) => {
    if (!currentSession || !currentUser) return;
    await apiRequest('/api/guide/demo-sessions/' + currentSession.id + '/complete', { method: 'POST', user: currentUser, body: JSON.stringify({ recording }) });
    setCurrentSession(null);
  };

  return { latestVersion: versions[0], versions, flows, recordings, currentSession, publishVersion, startDemoSession, completeDemoSession, setCurrentSession };
}
