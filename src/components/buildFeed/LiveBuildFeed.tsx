import React, { useState, useMemo } from 'react';
import { useBuildFeed } from '../../hooks/useBuildFeed';
import { Clock, CheckCircle2, User, PlayCircle, Hash, Github, Star, Link2, XCircle, AlertCircle, Filter, Zap, Target } from 'lucide-react';
import { CurrentFocus } from './CurrentFocus';
import { DailySignal } from './DailySignal';
import { StartHere } from './StartHere';
import { BuildStatus } from '../../types/buildFeed';
import { StatusBadge } from '../ui/StatusBadge';
import { isFounderAdminRole, normalizeRole } from '../../authRoles';
import { useI18n , tx } from '../../i18n/I18nProvider';

/**
 * Handles the live build feed workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function LiveBuildFeed() {
  const { formatRelativeTime, formatDate, formatNumber, t } = useI18n();
  const { 
    requests, updates, currentUser, currentUserProfile, 
    claimRequest, updateRequestStatus, updateRequest, 
    postUpdate, profiles, awardStar, dailySignals, 
    postDailySignal, toggleFocus 
  } = useBuildFeed();

  const [filter, setFilter] = useState<BuildStatus | 'All' | 'Current Focus' | 'My Claims'>('Current Focus');
  const [updateTexts, setUpdateTexts] = useState<Record<string, string>>({});
  const [prUrls, setPrUrls] = useState<Record<string, string>>({});
  const [showOnboarding, setShowOnboarding] = useState(true);

  const isAdmin = isFounderAdminRole(currentUser?.role);
  const role = normalizeRole(currentUser?.role || 'anonymous');

  const focusedRequests = useMemo(() => 
    requests.filter(r => r.is_current_focus).sort((a, b) => (a.focus_order || 0) - (b.focus_order || 0)),
  [requests]);

  const filteredRequests = useMemo(() => {
    let result = [...requests];
    
    if (filter === 'Current Focus') {
      // Default view: Focus + Open
      result = result.filter(r => r.is_current_focus || r.status === 'Open');
    } else if (filter === 'My Claims') {
      result = result.filter(r => r.claimed_by === currentUser?.id);
    } else if (filter !== 'All') {
      result = result.filter(r => r.status === filter);
    }
    
    return result.sort((a, b) => {
      // Current focus always top
      if (a.is_current_focus && !b.is_current_focus) return -1;
      if (!a.is_current_focus && b.is_current_focus) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [requests, filter]);
  
  const canClaim = role === 'vibe_coder' && Boolean(currentUserProfile) && currentUserProfile?.status !== 'Incomplete Profile';
  const claimDisabledReason = role === 'anonymous'
    ?tx("uiStrings.components.buildfeed.livebuildfeed.001")
    : !currentUserProfile
      ?tx("uiStrings.components.buildfeed.livebuildfeed.002")
      : currentUserProfile.status === 'Incomplete Profile'
        ?tx("uiStrings.components.buildfeed.livebuildfeed.003")
        :tx("uiStrings.components.buildfeed.livebuildfeed.004");

  return (
    <div className="flex-1 overflow-auto bg-[#0A0A0A] p-4 md:p-8 space-y-12 scrollbar-thin">
      <div className="mx-auto max-w-5xl space-y-12">
        
        {/* Header & Daily Signal */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,25rem)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="mb-2 flex min-w-0 items-center gap-4 break-words text-3xl font-black leading-tight text-white">{tx("uiLegacy.components.buildfeed.livebuildfeed.001")}<span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              </h1>
              <p className="max-w-md break-words text-sm font-medium leading-relaxed text-text-dim">{tx("uiLegacy.components.buildfeed.livebuildfeed.002")}</p>
            </div>
            
            <DailySignal 
              signals={dailySignals} 
              isAdmin={isAdmin} 
              onPostSignal={postDailySignal} 
            />
          </div>

          <div className="hidden lg:block space-y-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
             <div className="flex min-w-0 items-center gap-2 text-accent">
               <Zap size={16} fill="currentColor" />
               <span className="break-words text-[10px] font-black leading-snug">{tx("uiLegacy.components.buildfeed.livebuildfeed.003")}</span>
             </div>
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               {[
                 { label:tx("uiStrings.components.buildfeed.livebuildfeed.005"), val: requests.length },
                 { label:tx("uiStrings.components.buildfeed.livebuildfeed.006"), val: requests.filter(r => r.status === 'Open').length },
                 { label:tx("uiStrings.components.buildfeed.livebuildfeed.007"), val: requests.filter(r => r.status === 'Accepted').length },
                 { label:tx("uiStrings.components.buildfeed.livebuildfeed.008"), val: profiles.length }
               ].map((stat, i) => (
                 <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5">
                   <p className="break-words text-[10px] font-bold leading-snug text-text-dim">{stat.label}</p>
                   <p className="text-xl font-black text-white mt-1">{stat.val}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Builder Onboarding */}
        {showOnboarding && !isFounderAdminRole(role) && (
          <div className="relative">
            <StartHere 
              onAction={(action) => {
                if (action === 'profile') window.location.hash = '#profile';
              }} 
            />
            <button 
              onClick={() => setShowOnboarding(false)}
              className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        {/* Current Focus Layer */}
        <CurrentFocus 
          focusedRequests={focusedRequests} 
          onClaim={claimRequest}
          isAdmin={isAdmin}
          onRemoveFocus={(id) => toggleFocus(id)}
        />

        {/* Build requests list */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
            <div className="flex min-w-0 items-center gap-3">
              <Filter size={16} className="text-accent" />
              <h3 className="break-words text-sm font-black leading-snug text-white">{tx("uiLegacy.components.buildfeed.livebuildfeed.004")}</h3>
            </div>
            
            <div className="flex min-w-0 flex-wrap gap-2">
              {['Current Focus', 'All', 'My Claims', 'Open', 'In Progress', 'Ready for Review', 'Accepted', 'Backlog'].map((f) => {
                if (f === 'My Claims' && role !== 'vibe_coder') return null;
                return (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`min-w-0 rounded-full border px-4 py-1.5 text-[10px] font-black leading-snug transition-all whitespace-normal break-words ${
                    filter === f 
                      ? 'bg-accent text-white border-accent shadow-[0_0_15px_rgba(255,107,0,0.3)]' 
                      : 'bg-white/5 text-text-dim border-white/5 hover:border-white/20'
                  }`}
                >
                  {f}
                </button>
              )})}
            </div>
          </div>

          <div className="space-y-6">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-24 bg-[#111] border border-white/5 rounded-[40px] border-dashed space-y-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Zap size={24} className="text-text-dim" />
                </div>
                <StatusBadge status="Read" label={tx("uiLegacy.components.buildfeed.livebuildfeed.005")} />
                <p className="break-words text-xs font-black leading-snug text-text-dim">{tx("uiLegacy.components.buildfeed.livebuildfeed.006")}</p>
                <p className="mx-auto max-w-md break-words text-xs text-white/45">{tx("uiLegacy.components.buildfeed.livebuildfeed.007")}</p>
                <button 
                  onClick={() => setFilter('All')}
                  className="mt-4 break-words text-[10px] font-black leading-snug text-accent hover:underline"
                >{tx("uiLegacy.components.buildfeed.livebuildfeed.008")}</button>
              </div>
            ) : (
              filteredRequests.map(req => {
                const reqUpdates = updates.filter(u => u.build_request_id === req.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                const claimedProfile = req.claimed_by_profile_id ? profiles.find(p => p.id === req.claimed_by_profile_id) : null;
                const lastProgressUpdate = reqUpdates.length > 0 ? reqUpdates[reqUpdates.length - 1] : null;

                return (
                  <div key={req.id} className={`group bg-[#111] border rounded-[32px] overflow-hidden transition-all hover:bg-[#151515] ${req.is_current_focus ? 'border-accent/40 shadow-2xl shadow-accent/5' : 'border-white/5'}`}>
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row gap-6 md:justify-between md:items-start">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="break-words text-xl font-black tracking-tight text-white transition-colors group-hover:text-accent">
                            {req.polished_title}
                          </h2>
                          <StatusBadge status={req.status} />
                          {req.is_current_focus && (
                            <span className="flex min-w-0 items-center gap-1 rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-[10px] font-black leading-snug text-accent">
                              <Target size={12} />{tx("uiLegacy.components.buildfeed.livebuildfeed.009")}</span>
                          )}
                          {req.status === 'Accepted' && (
                            <span className="flex min-w-0 items-center gap-1.5 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-black leading-snug text-amber-400">
                              <Star size={12} className="fill-amber-400" />{tx("uiLegacy.components.buildfeed.livebuildfeed.010")}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-text-dim">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} /> 
                            <span>{formatRelativeTime(req.created_at)}</span>
                          </div>
                          {claimedProfile && (
                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                              <User size={12} className="text-accent" />
                              <span className="break-words font-bold text-white">@{claimedProfile.username}</span>
                            </div>
                          )}
                          
                          <div className="flex min-w-0 flex-wrap gap-2">
                            {req.github_issue_url ? (
                              <a href={req.github_issue_url} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1.5 break-words text-[10px] font-black leading-snug text-white/50 transition-colors hover:text-accent">
                                <Github size={14} />{tx("uiLegacy.components.buildfeed.livebuildfeed.011")}{req.github_issue_number}
                              </a>
                            ) : null}
                            {req.implementation_pr_url && (
                               <a href={req.implementation_pr_url} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1.5 break-words text-[10px] font-black leading-snug text-purple-400 hover:text-purple-300">
                                <Link2 size={14} />{tx("uiLegacy.components.buildfeed.livebuildfeed.012")}</a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-3 shrink-0">
                         <div className="flex min-w-0 flex-wrap gap-2 text-[10px] font-black leading-snug">
                            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-500/10">{req.type}</span>
                            <span className="bg-white/5 text-text-dim px-3 py-1.5 rounded-xl border border-white/5 font-mono">{req.difficulty}</span>
                            <span className={`px-3 py-1.5 rounded-xl border font-mono ${req.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-text-dim border-white/5'}`}>{req.priority}</span>
                         </div>
                         
                         {isAdmin && (
                            <button
                              onClick={async () => {
                                try {
                                  await toggleFocus(req.id);
                                } catch (e: any) {
                                  alert(e.message);
                                }
                              }}
                              className={`min-w-0 rounded-xl border px-4 py-1.5 text-[10px] font-black leading-snug transition-all whitespace-normal break-words ${
                                req.is_current_focus 
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                                  : 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20'
                              }`}
                            >
                              {req.is_current_focus ?tx("uiStrings.components.buildfeed.livebuildfeed.009") :tx("uiStrings.components.buildfeed.livebuildfeed.010")}
                            </button>
                         )}
                      </div>
                    </div>

                    {/* Progress Update Spotlight */}
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-white/[0.01] px-6 py-4 md:px-8">
                       <div className="flex min-w-0 items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-accent/40" />
                         <p className="break-words text-[10px] font-black leading-snug text-text-dim">{tx("uiLegacy.components.buildfeed.livebuildfeed.013")}</p>
                       </div>
                       <div className="flex-1 flex items-center gap-3 overflow-hidden">
                          {lastProgressUpdate ? (
                             <p className="break-words text-xs font-medium italic text-white/50">"{lastProgressUpdate.update_text}"</p>
                          ) : (
                             <p className="break-words text-[10px] font-bold italic leading-snug text-text-dim">{tx("uiLegacy.components.buildfeed.livebuildfeed.014")}</p>
                          )}
                       </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8">
                      <div className="space-y-6">
                        <div>
                          <h4 className="mb-2 break-words text-[10px] font-black leading-snug text-accent">{tx("uiLegacy.components.buildfeed.livebuildfeed.015")}</h4>
                          <p className="text-sm text-white/70 leading-relaxed">{req.polished_context}</p>
                        </div>
                        <div>
                          <h4 className="mb-2 break-words text-[10px] font-black leading-snug text-accent">{tx("uiLegacy.components.buildfeed.livebuildfeed.016")}</h4>
                          <p className="text-sm text-white/90 leading-relaxed font-semibold">{req.polished_change}</p>
                        </div>
                        
                        {req.status === 'Open' && !isFounderAdminRole(role) && (
                          <div className="pt-4 space-y-3">
                            <button
                              onClick={() => claimRequest(req.id)}
                              disabled={!canClaim}
                              title={!canClaim ? claimDisabledReason :tx("uiStrings.components.buildfeed.livebuildfeed.011")}
                              className="w-full min-w-0 rounded-[20px] bg-accent px-6 py-3 text-center text-xs font-black leading-snug text-white shadow-xl shadow-accent/20 transition-all hover:bg-accent/90 disabled:grayscale disabled:opacity-50 whitespace-normal break-words md:w-auto md:px-10"
                            >
                              {role === 'anonymous' ?tx("uiStrings.components.buildfeed.livebuildfeed.012") : canClaim ?tx("uiStrings.components.buildfeed.livebuildfeed.013") :tx("uiStrings.components.buildfeed.livebuildfeed.014")}
                            </button>
                            {!canClaim && (
                              <p className="break-words text-[10px] font-bold leading-snug text-amber-300/80">{tx("uiLegacy.components.buildfeed.livebuildfeed.017")}{claimDisabledReason}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                         <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                           <h4 className="break-words text-[10px] font-black leading-snug text-text-dim">{tx("uiLegacy.components.buildfeed.livebuildfeed.018")}</h4>
                           <ul className="space-y-3">
                             {req.acceptance_criteria?.map((crt, i) => (
                               <li key={i} className="flex min-w-0 items-start gap-3 break-words text-xs text-white/60 group/li">
                                 <div className="mt-1 p-0.5 rounded-full bg-white/5 group-hover/li:bg-accent/20 group-hover/li:text-accent transition-colors">
                                   <Hash size={10} />
                                 </div>
                                 <span className="leading-relaxed">{crt}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
                      </div>
                    </div>

                    {/* Interactive Shell (if claimed) */}
                    {(req.status !== 'Open') && (
                      <div className="bg-black/40 border-t border-white/5 p-6 md:p-8 space-y-6">
                        {reqUpdates.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="break-words text-[10px] font-black leading-snug text-text-dim">{tx("uiLegacy.components.buildfeed.livebuildfeed.019")}</h4>
                            {reqUpdates.map(u => {
                              const uProfile = u.profile_id ? profiles.find(p => p.id === u.profile_id) : null;
                              return (
                                <div key={u.id} className="flex min-w-0 gap-4 group/update">
                                  <div className="w-8 h-8 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/update:border-accent/40 transition-colors">
                                    <User size={14} className="text-text-dim group-hover/update:text-accent" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                      <span className="break-words text-xs font-black text-white">{uProfile?.username || u.user_id}</span>
                                      <span className="text-[10px] text-text-dim font-mono">{formatRelativeTime(u.created_at)}</span>
                                    </div>
                                    <p className="break-words text-sm text-white/70">{u.update_text}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Builder Add Update */}
                        {((currentUser?.id === req.claimed_by) || isFounderAdminRole(role)) && req.status !== 'Accepted' && req.status !== 'Done' && (
                          <div className="flex min-w-0 flex-wrap gap-3">
                            <input
                              type="text"
                              value={updateTexts[req.id] || ''}
                              onChange={e => setUpdateTexts({ ...updateTexts, [req.id]: e.target.value })}
                              placeholder={tx("uiLegacy.components.buildfeed.livebuildfeed.020")}
                              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#111] px-4 py-2 text-sm text-white focus:border-accent/40 focus:outline-none"
                              onKeyDown={e => {
                                if (e.key === 'Enter' && updateTexts[req.id]?.trim()) {
                                  postUpdate(req.id, updateTexts[req.id]);
                                  setUpdateTexts({ ...updateTexts, [req.id]: '' });
                                }
                              }}
                            />
                          </div>
                        )}

                        {/* Workflow Actions */}
                        {currentUser?.id === req.claimed_by && req.status !== 'Accepted' && req.status !== 'Done' && (
                          <div className="flex flex-wrap gap-4 pt-2">
                            {req.status === 'Claimed' && (
                              <button
                                onClick={() => updateRequestStatus(req.id, 'In Progress')}
                                className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-blue-400/20 px-4 py-2 text-center text-xs font-black leading-snug text-blue-400 hover:bg-blue-400/10 whitespace-normal break-words"
                              >
                                <PlayCircle size={14} />{tx("uiLegacy.components.buildfeed.livebuildfeed.021")}</button>
                            )}
                            
                            {(req.status === 'In Progress' || req.status === 'Needs Changes') && (
                              <div className="flex w-full min-w-0 flex-wrap items-center gap-4">
                                <input 
                                  type="text"
                                  value={prUrls[req.id] || req.implementation_pr_url || ''}
                                  onChange={e => setPrUrls({...prUrls, [req.id]: e.target.value})}
                                  placeholder={tx("uiLegacy.components.buildfeed.livebuildfeed.022")}
                                  className="min-w-0 flex-1 basis-64 rounded-xl border border-white/10 bg-black px-4 py-2 text-xs text-white"
                                />
                                <button
                                  onClick={() => {
                                    const url = prUrls[req.id] || req.implementation_pr_url;
                                    if (!url) return;
                                    updateRequest(req.id, { implementation_pr_url: url, status: 'Ready for Review' });
                                  }}
                                  className="min-w-0 rounded-xl border border-purple-500/20 bg-purple-500/20 px-6 py-2 text-center text-[10px] font-black leading-snug text-purple-400 whitespace-normal break-words"
                                >{tx("uiLegacy.components.buildfeed.livebuildfeed.023")}</button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Admin Review */}
                        {isFounderAdminRole(role) && req.status === 'Ready for Review' && (
                          <div className="flex min-w-0 flex-wrap gap-3 pt-2">
                             <button
                               onClick={() => {
                                 if (!currentUser?.id) return;
                                 updateRequest(req.id, { status: 'Accepted', accepted_by: currentUser.id, accepted_at: new Date().toISOString() });
                                 if (req.claimed_by_profile_id) awardStar(req.claimed_by_profile_id, req.id);
                               }}
                               className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2 text-center text-[10px] font-black leading-snug text-black whitespace-normal break-words"
                             >
                               <Star size={14} fill="currentColor" />{tx("uiLegacy.components.buildfeed.livebuildfeed.024")}</button>
                             <button
                               onClick={() => updateRequest(req.id, { status: 'Needs Changes' })}
                               className="min-w-0 rounded-xl border border-white/10 px-6 py-2 text-center text-[10px] font-black leading-snug text-white whitespace-normal break-words"
                             >{tx("uiLegacy.components.buildfeed.livebuildfeed.025")}</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
