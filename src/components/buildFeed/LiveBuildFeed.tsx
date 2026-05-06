import React, { useState, useMemo } from 'react';
import { useBuildFeed } from '../../hooks/useBuildFeed';
import { Clock, CheckCircle2, User, PlayCircle, Hash, Github, Star, Link2, XCircle, AlertCircle, Filter, Zap, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CurrentFocus } from './CurrentFocus';
import { DailySignal } from './DailySignal';
import { StartHere } from './StartHere';
import { BuildStatus } from '../../types/buildFeed';
import { StatusBadge } from '../ui/StatusBadge';

/**
 * Handles the live build feed workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function LiveBuildFeed() {
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

  const isAdmin = currentUser?.role === 'admin';
  const role = currentUser?.role || 'anonymous';

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
    ? 'Sign in and create a builder profile before claiming work.'
    : !currentUserProfile
      ? 'Create your builder profile before claiming a request.'
      : currentUserProfile.status === 'Incomplete Profile'
        ? 'Complete required profile fields to become eligible to claim.'
        : 'This request can be claimed when it is Open and unclaimed.';

  return (
    <div className="flex-1 overflow-auto bg-[#0A0A0A] p-4 md:p-8 space-y-12 scrollbar-thin">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header & Daily Signal */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-4">
                Live Build Feed
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              </h1>
              <p className="text-sm text-text-dim max-w-md leading-relaxed font-medium">
                Real-time build requests from the founder. High signal, low noise. Claim a ticket and start building.
              </p>
            </div>
            
            <DailySignal 
              signals={dailySignals} 
              isAdmin={isAdmin} 
              onPostSignal={postDailySignal} 
            />
          </div>

          <div className="hidden lg:block space-y-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
             <div className="flex items-center gap-2 text-accent">
               <Zap size={16} fill="currentColor" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Platform Stats</span>
             </div>
             <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Builds', val: requests.length },
                 { label: 'Open', val: requests.filter(r => r.status === 'Open').length },
                 { label: 'Completed', val: requests.filter(r => r.status === 'Accepted').length },
                 { label: 'Coders', val: profiles.length }
               ].map((stat, i) => (
                 <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5">
                   <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{stat.label}</p>
                   <p className="text-xl font-black text-white mt-1">{stat.val}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Builder Onboarding */}
        {showOnboarding && role !== 'admin' && (
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
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-accent" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Filter Stream</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['Current Focus', 'All', 'My Claims', 'Open', 'In Progress', 'Ready for Review', 'Accepted', 'Backlog'].map((f) => {
                if (f === 'My Claims' && role !== 'vibe_coder') return null;
                return (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
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
                <StatusBadge status="Read" label="Empty State" />
                <p className="text-text-dim font-black uppercase tracking-[0.2em] text-xs">No matching requests found in the stream.</p>
                <p className="text-xs text-white/45 max-w-md mx-auto">This filter has no visible work right now. Clear filters to see all requests, or check Current Founder Focus for the highest-priority next action.</p>
                <button 
                  onClick={() => setFilter('All')}
                  className="mt-4 text-accent text-[10px] font-black uppercase tracking-widest hover:underline"
                >
                  Clear all filters
                </button>
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
                          <h2 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-accent transition-colors">
                            {req.polished_title}
                          </h2>
                          <StatusBadge status={req.status} />
                          {req.is_current_focus && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded-md border border-accent/20">
                              <Target size={12} /> Focus
                            </span>
                          )}
                          {req.status === 'Accepted' && (
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                              <Star size={12} className="fill-amber-400" /> Star Awarded
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-text-dim">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} /> 
                            <span>{formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</span>
                          </div>
                          {claimedProfile && (
                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                              <User size={12} className="text-accent" />
                              <span className="font-bold text-white uppercase tracking-widest">@{claimedProfile.username}</span>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            {req.github_issue_url ? (
                              <a href={req.github_issue_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-white/50 hover:text-accent transition-colors">
                                <Github size={14} /> Issue #{req.github_issue_number}
                              </a>
                            ) : null}
                            {req.implementation_pr_url && (
                               <a href={req.implementation_pr_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-purple-400 hover:text-purple-300">
                                <Link2 size={14} /> PR Submitted
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-3 shrink-0">
                         <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
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
                              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                req.is_current_focus 
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                                  : 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20'
                              }`}
                            >
                              {req.is_current_focus ? 'Remove Focus' : 'Mark as Current Focus'}
                            </button>
                         )}
                      </div>
                    </div>

                    {/* Progress Update Spotlight */}
                    <div className="px-6 md:px-8 py-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between gap-4">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-accent/40" />
                         <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">Latest Momentum</p>
                       </div>
                       <div className="flex-1 flex items-center gap-3 overflow-hidden">
                          {lastProgressUpdate ? (
                             <p className="text-xs text-white/50 truncate italic font-medium">"{lastProgressUpdate.update_text}"</p>
                          ) : (
                             <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest italic leading-none">No update yet — waiting for builder signal.</p>
                          )}
                       </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Context & Problem</h4>
                          <p className="text-sm text-white/70 leading-relaxed">{req.polished_context}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Technical Implementation</h4>
                          <p className="text-sm text-white/90 leading-relaxed font-semibold">{req.polished_change}</p>
                        </div>
                        
                        {req.status === 'Open' && role !== 'admin' && (
                          <div className="pt-4 space-y-3">
                            <button
                              onClick={() => claimRequest(req.id)}
                              disabled={!canClaim}
                              title={!canClaim ? claimDisabledReason : 'Claim this Open request and start the builder workflow.'}
                              className="w-full md:w-auto px-12 py-3 bg-accent text-white rounded-[20px] text-xs font-black uppercase tracking-[0.2em] hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 disabled:grayscale disabled:opacity-50"
                            >
                              {role === 'anonymous' ? "Sign in to claim this request" : canClaim ? "Claim this request" : "Complete profile to claim"}
                            </button>
                            {!canClaim && (
                              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300/80">Why disabled: {claimDisabledReason}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                         <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                           <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">Acceptance Criteria</h4>
                           <ul className="space-y-3">
                             {req.acceptance_criteria?.map((crt, i) => (
                               <li key={i} className="text-xs text-white/60 flex gap-3 items-start group/li">
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
                            <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">Build Stream</h4>
                            {reqUpdates.map(u => {
                              const uProfile = u.profile_id ? profiles.find(p => p.id === u.profile_id) : null;
                              return (
                                <div key={u.id} className="flex gap-4 group/update">
                                  <div className="w-8 h-8 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/update:border-accent/40 transition-colors">
                                    <User size={14} className="text-text-dim group-hover/update:text-accent" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-black text-white uppercase tracking-widest">{uProfile?.username || u.user_id}</span>
                                      <span className="text-[10px] text-text-dim font-mono">{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-sm text-white/70">{u.update_text}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Builder Add Update */}
                        {((currentUser?.id === req.claimed_by) || role === 'admin') && req.status !== 'Accepted' && req.status !== 'Done' && (
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={updateTexts[req.id] || ''}
                              onChange={e => setUpdateTexts({ ...updateTexts, [req.id]: e.target.value })}
                              placeholder="Add a progress update/note..."
                              className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent/40"
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
                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 hover:bg-blue-400/10 px-4 py-2 rounded-xl border border-blue-400/20"
                              >
                                <PlayCircle size={14} /> Start Progress
                              </button>
                            )}
                            
                            {(req.status === 'In Progress' || req.status === 'Needs Changes') && (
                              <div className="flex items-center gap-4 w-full">
                                <input 
                                  type="text"
                                  value={prUrls[req.id] || req.implementation_pr_url || ''}
                                  onChange={e => setPrUrls({...prUrls, [req.id]: e.target.value})}
                                  placeholder="GitHub PR URL"
                                  className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                                />
                                <button
                                  onClick={() => {
                                    const url = prUrls[req.id] || req.implementation_pr_url;
                                    if (!url) return;
                                    updateRequest(req.id, { implementation_pr_url: url, status: 'Ready for Review' });
                                  }}
                                  className="px-6 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-500/20"
                                >
                                  Submit Review
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Admin Review */}
                        {role === 'admin' && req.status === 'Ready for Review' && (
                          <div className="flex gap-3 pt-2">
                             <button
                               onClick={() => {
                                 if (!currentUser?.id) return;
                                 updateRequest(req.id, { status: 'Accepted', accepted_by: currentUser.id, accepted_at: new Date().toISOString() });
                                 if (req.claimed_by_profile_id) awardStar(req.claimed_by_profile_id, req.id);
                               }}
                               className="flex items-center gap-2 bg-amber-500 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase"
                             >
                               <Star size={14} fill="currentColor" /> Accept & Star
                             </button>
                             <button
                               onClick={() => updateRequest(req.id, { status: 'Needs Changes' })}
                               className="px-6 py-2 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase"
                             >
                               Needs Changes
                             </button>
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
