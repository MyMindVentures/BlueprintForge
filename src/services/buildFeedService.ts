import { BuildRequest, BuildRequestUpdate, VibeCoderProfile, DailySignal, UserContext } from '../types/buildFeed';
import { apiRequest, pollingIntervalMs } from './apiClient';

export interface BuildFeedSnapshot {
  requests: BuildRequest[];
  updates: BuildRequestUpdate[];
  profiles: VibeCoderProfile[];
  dailySignals: DailySignal[];
}

function poll<T>(loader: () => Promise<T>, callback: (value: T) => void) {
  let active = true;
  const run = async () => {
    if (!active) return;
    try { callback(await loader()); } catch (error) { console.error('PostgreSQL polling failed:', error); }
  };
  run();
  const interval = window.setInterval(run, pollingIntervalMs);
  return () => { active = false; window.clearInterval(interval); };
}

export const buildFeedService = {
  fetchSnapshot: () => apiRequest<BuildFeedSnapshot>('/api/build-feed'),
  subscribeToRequests: (callback: (requests: BuildRequest[]) => void) => poll(async () => (await buildFeedService.fetchSnapshot()).requests, callback),
  subscribeToDailySignals: (callback: (signals: DailySignal[]) => void) => poll(async () => (await buildFeedService.fetchSnapshot()).dailySignals, callback),
  subscribeToProfiles: (callback: (profiles: VibeCoderProfile[]) => void) => poll(async () => (await buildFeedService.fetchSnapshot()).profiles, callback),
  subscribeToSnapshot: (callback: (snapshot: BuildFeedSnapshot) => void) => poll(buildFeedService.fetchSnapshot, callback),
  publishRequest: async (request: Partial<BuildRequest>, user: UserContext) => (await apiRequest<{ id: string }>('/api/build-requests', { method: 'POST', user, body: JSON.stringify({ request }) })).id,
  updateRequest: (id: string, updates: Partial<BuildRequest>, user: UserContext) => apiRequest('/api/build-requests/' + id, { method: 'PATCH', user, body: JSON.stringify({ updates }) }),
  claimTicket: (requestId: string, user: UserContext, profileId: string) => apiRequest('/api/build-requests/' + requestId + '/claim', { method: 'POST', user, body: JSON.stringify({ profileId }) }),
  postUpdate: (requestId: string, user: UserContext, profileId: string | null, updateText: string) => apiRequest('/api/build-requests/' + requestId + '/updates', { method: 'POST', user, body: JSON.stringify({ profileId, updateText }) }),
  saveProfile: (profile: Partial<VibeCoderProfile>, user: UserContext, profileId?: string) => apiRequest('/api/builder-profiles', { method: 'POST', user, body: JSON.stringify({ profile, profileId }) }),
  verifyProfile: (profileId: string, user: UserContext) => apiRequest('/api/builder-profiles/' + profileId + '/verify', { method: 'PATCH', user }),
  awardStar: (profileId: string, requestId: string, user: UserContext) => apiRequest('/api/builder-profiles/' + profileId + '/stars', { method: 'POST', user, body: JSON.stringify({ buildRequestId: requestId }) }),
  postDailySignal: (message: string, user: UserContext) => apiRequest('/api/daily-signals', { method: 'POST', user, body: JSON.stringify({ message }) })
};
