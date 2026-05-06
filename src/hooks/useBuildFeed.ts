import { useState, useEffect } from 'react';
import { BuildRequest, BuildRequestUpdate, VibeCoderProfile, DailySignal } from '../types/buildFeed';
import { buildFeedService } from '../services/buildFeedService';
import { useAuth } from './useAuth';

export function useBuildFeed() {
  const { profile: currentUser } = useAuth();
  const [requests, setRequests] = useState<BuildRequest[]>([]);
  const [updates, setUpdates] = useState<BuildRequestUpdate[]>([]);
  const [profiles, setProfiles] = useState<VibeCoderProfile[]>([]);
  const [dailySignals, setDailySignals] = useState<DailySignal[]>([]);
  const [lastNotification] = useState<BuildRequest | null>(null);
  const currentUserProfile = profiles.find(p => p.user_id === currentUser?.id);

  useEffect(() => buildFeedService.subscribeToSnapshot((snapshot) => {
    setRequests(snapshot.requests);
    setUpdates(snapshot.updates);
    setProfiles(snapshot.profiles);
    setDailySignals(snapshot.dailySignals);
  }), []);

  const publishRequest = async (request: any) => currentUser?.role === 'admin' ? buildFeedService.publishRequest(request, currentUser) : undefined;
  const updateRequest = async (id: string, updates: Partial<BuildRequest>) => currentUser ? buildFeedService.updateRequest(id, updates, currentUser) : undefined;
  const claimRequest = async (id: string) => currentUser && currentUserProfile ? buildFeedService.claimTicket(id, currentUser, currentUserProfile.id) : undefined;
  const updateRequestStatus = async (id: string, status: BuildRequest['status']) => updateRequest(id, { status });
  const postUpdate = async (build_request_id: string, update_text: string) => currentUser ? buildFeedService.postUpdate(build_request_id, currentUser, currentUserProfile?.id || null, update_text) : undefined;
  const saveProfile = async (profileData: Partial<VibeCoderProfile>) => currentUser ? buildFeedService.saveProfile(profileData, currentUser, currentUserProfile?.id) : undefined;
  const verifyProfile = async (profileId: string) => currentUser?.role === 'admin' ? buildFeedService.verifyProfile(profileId, currentUser) : undefined;
  const awardStar = async (profileId: string, buildRequestId: string) => currentUser?.role === 'admin' ? buildFeedService.awardStar(profileId, buildRequestId, currentUser) : undefined;
  const postDailySignal = async (message: string) => currentUser?.role === 'admin' ? buildFeedService.postDailySignal(message, currentUser) : undefined;
  const toggleFocus = async (id: string, reason?: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const request = requests.find(r => r.id === id);
    if (!request) return;
    const currentlyFocused = requests.filter(r => r.is_current_focus).length;
    const isEnabling = !request.is_current_focus;
    if (isEnabling && currentlyFocused >= 3) throw new Error('Maximum 3 focus requests allowed.');
    return updateRequest(id, { is_current_focus: isEnabling, focus_reason: isEnabling ? (reason || null) : null, focus_order: isEnabling ? currentlyFocused + 1 : null });
  };

  return { requests, updates, profiles, currentUser, currentUserProfile, publishRequest, updateRequest, claimRequest, updateRequestStatus, postUpdate, saveProfile, verifyProfile, awardStar, toggleFocus, postDailySignal, dailySignals, lastNotification };
}
