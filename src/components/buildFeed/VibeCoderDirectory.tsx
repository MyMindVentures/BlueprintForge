import React, { useState } from 'react';
import { useBuildFeed } from '../../hooks/useBuildFeed';
import { ShieldCheck, Search, Globe, Code2, User, PlayCircle, AlertCircle } from 'lucide-react';

export function VibeCoderDirectory() {
  const { profiles, currentUser, verifyProfile, requests } = useBuildFeed();
  const [searchTerm, setSearchTerm] = useState('');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0A0A0A] p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto opacity-50" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-text-dim max-w-md">Only the Founder/Admin can access the Vibe Coder Directory.</p>
        </div>
      </div>
    );
  }

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto bg-[#0A0A0A] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Vibe Coder Directory</h1>
            <p className="text-sm text-text-dim">Your growing network of registered builders and digital nomads.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              type="text"
              placeholder="Search by name, skill, country..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-[#111] border border-white/5 rounded-3xl">
              <p className="text-text-dim font-black uppercase tracking-widest text-xs">No vibe coders found.</p>
            </div>
          ) : (
            filteredProfiles.map(profile => {
              const claimedRequests = requests.filter(r => r.claimed_by_profile_id === profile.id);
              const completedCount = claimedRequests.filter(r => r.status === 'Done').length;

              return (
                <div key={profile.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 space-y-6 flex flex-col hover:border-white/10 transition-colors relative overflow-hidden">
                  {profile.status === 'Verified Builder' && (
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
                  )}

                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/50 shrink-0">
                         {profile.status === 'Verified Builder' ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <User className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white truncate max-w-[160px]">{profile.name}</h3>
                        <p className="text-xs text-text-dim font-mono">@{profile.username}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 ${
                      profile.status === 'Verified Builder' ? 'bg-emerald-500/10 text-emerald-400' :
                      profile.status === 'Active Builder' ? 'bg-accent/10 text-accent' :
                      'bg-white/5 text-text-dim'
                    }`}>
                      {profile.status}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <Globe className="w-3.5 h-3.5 text-text-dim" />
                      <span>{profile.country} {profile.timezone && `(${profile.timezone})`}</span>
                    </div>
                    {profile.skills && (
                       <div className="flex items-start gap-2 text-xs text-white/80">
                         <Code2 className="w-3.5 h-3.5 text-text-dim mt-0.5 shrink-0" />
                         <span className="line-clamp-2 leading-relaxed">{profile.skills}</span>
                       </div>
                    )}
                    {profile.availability && (
                        <div className="flex items-center gap-2 text-xs text-white/80">
                          <PlayCircle className="w-3.5 h-3.5 text-text-dim" />
                          <span>{profile.availability}</span>
                        </div>
                    )}
                  </div>

                  <div className="bg-black/40 rounded-xl p-4 flex justify-between items-center border border-white/5">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-text-dim">Claimed</div>
                      <div className="text-lg font-bold text-white">{claimedRequests.length}</div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-text-dim">Completed</div>
                      <div className="text-lg font-bold text-emerald-400">{completedCount}</div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-text-dim">Paid Work</div>
                      <div className="text-xs font-bold text-white mt-1">{profile.looking_for_paid_work ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {profile.status !== 'Verified Builder' && profile.status !== 'Incomplete Profile' && (
                    <button 
                      onClick={() => verifyProfile(profile.id)}
                      className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> Verify Builder
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
