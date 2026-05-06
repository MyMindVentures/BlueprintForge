import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { AppNotification } from '../types/buildFeed';
import { apiRequest, pollingIntervalMs } from '../services/apiClient';
import { useI18n } from '../i18n/I18nProvider';

export function useNotifications() {
  const { profile: currentUser } = useAuth();
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const load = async () => {
      try { if (active) setNotifications(await apiRequest<AppNotification[]>('/api/notifications', { user: currentUser })); }
      catch (error) { console.error(t('errors.notificationPollingFailed'), error); }
    };
    load();
    const interval = window.setInterval(load, pollingIntervalMs);
    return () => { active = false; window.clearInterval(interval); };
  }, [currentUser, t]);

  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    await apiRequest('/api/notifications/' + id + '/read', { method: 'PATCH', user: currentUser });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const createNotification = async (notification: Omit<AppNotification, 'id' | 'created_at'>) => {
    if (!currentUser) return;
    await apiRequest('/api/notifications', { method: 'POST', user: currentUser, body: JSON.stringify({ notification }) });
  };

  return { notifications, markAsRead, createNotification };
}
