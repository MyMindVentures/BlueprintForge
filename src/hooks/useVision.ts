import { useState, useEffect } from 'react';
import { FounderVision } from '../types/vision';
import { useAuth } from './useAuth';
import { apiRequest, pollingIntervalMs } from '../services/apiClient';

export function useVision() {
  const [visions, setVisions] = useState<FounderVision[]>([]);
  const { profile: currentUser } = useAuth();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try { const data = await apiRequest<FounderVision[]>('/api/visions'); if (active) setVisions(data); }
      catch (error) { console.error('Vision polling failed:', error); }
    };
    load();
    const interval = window.setInterval(load, pollingIntervalMs);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const publishVision = async (vision: Omit<FounderVision, 'id' | 'created_at'>) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const response = await apiRequest<{ id: string }>('/api/visions', { method: 'POST', user: currentUser, body: JSON.stringify({ vision }) });
    return { id: response.id, ...vision };
  };

  return { visions, publishVision };
}
