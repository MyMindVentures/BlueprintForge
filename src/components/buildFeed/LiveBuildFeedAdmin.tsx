import React, { useState } from 'react';
import { useBuildFeed } from '../../hooks/useBuildFeed';
import { useWorkspace } from '../../hooks/useWorkspace';
import { AIService } from '../../services/aiService';
import { BuildRequest, BuildPriority, BuildDifficulty, BuildType } from '../../types/buildFeed';
import { Loader2, Plus, Sparkles, Send, Edit3, Check, X, Github, Target, Radio, Clock, User, Zap } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { useGithubSettings } from '../../hooks/useGithubSettings';
import { createGithubIssue } from '../../services/githubClient';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from '../ui/StatusBadge';

export function LiveBuildFeedAdmin() {
  const { requests, publishRequest, updateRequest, toggleFocus, postDailySignal, dailySignals, profiles } = useBuildFeed();
  const { llmSettings } = useWorkspace();
  const { settings: githubSettings } = useGithubSettings();
  const { success, error, info } = useToast();
  
  const [rawInput, setRawInput] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [polishedResult, setPolishedResult] = useState<Partial<BuildRequest> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [signalText, setSignalText] = useState('');
  const [isPostingSignal, setIsPostingSignal] = useState(false);

  const handlePolish = async () => {
    if (!rawInput.trim()) {
      error("Please enter what you want to build.");
      return;
    }
    
    if (!llmSettings.openRouterApiKey) {
      error("Missing OpenRouter API Key in OpenRouter Settings.");
      return;
    }

    setIsPolishing(true);
    const aiService = new AIService(llmSettings.openRouterApiKey, llmSettings.defaultModelId || 'openai/gpt-4o-mini');
    
    try {
      const parsed = await aiService.polishTicket(rawInput);
      setPolishedResult({
        raw_input: rawInput,
        polished_title: parsed.title,
        polished_context: parsed.problem || parsed.context,
        polished_change: parsed.goal || parsed.requested_change,
        polished_ui_ux: parsed.ui_ux_requirements || parsed.expected_ui_ux,
        acceptance_criteria: parsed.acceptance_criteria || [],
        priority: parsed.priority || "Medium",
        difficulty: parsed.difficulty || "Medium",
        type: parsed.type || "App Improvement"
      });
      success("Build request polished!");
      setIsEditing(false);
    } catch (e: any) {
      error(`Error polishing request: ${e.message}`);
    } finally {
      setIsPolishing(false);
    }
  };

  const handlePublish = async () => {
    if (!polishedResult) return;
    
    setIsPublishing(true);
    try {
      const newRequestId = await publishRequest(polishedResult as any);
      setPolishedResult(null);
      setRawInput('');

      if (githubSettings.auto_create_issues && githubSettings.github_token) {
        try {
          const newRequest = { id: newRequestId, ...polishedResult } as BuildRequest;
          const ghResponse = await createGithubIssue(newRequest, githubSettings);
          await updateRequest(newRequest.id, {
            github_issue_url: ghResponse.url,
            github_issue_number: ghResponse.number,
            github_repo_url: githubSettings.repo_url,
            github_sync_status: 'success',
            github_created_at: new Date().toISOString()
          });
          success("Published and GitHub issue created!");
        } catch (err: any) {
          await updateRequest(newRequestId, { github_sync_status: 'failed' });
          error(`Feed published, but GitHub issue creation failed: ${err.message}`);
        }
      } else {
        success("Published to Builder Network!");
      }
    } catch (e: any) {
      error(e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePostSignal = async () => {
    if (!signalText.trim()) return;
    setIsPostingSignal(true);
    try {
      await postDailySignal(signalText);
      setSignalText('');
      success("Daily Signal Broadcasted!");
    } catch (e: any) {
      error(e.message);
    } finally {
      setIsPostingSignal(false);
    }
  };

  const updateField = (field: keyof BuildRequest, value: any) => {
    if (polishedResult) {
      setPolishedResult({ ...polishedResult, [field]: value });
    }
  };

  const focusedCount = requests.filter(r => r.is_current_focus).length;

  return (
    <div className="flex-1 overflow-auto bg-[#0A0A0A] p-4 md:p-8 space-y-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-4">
              Founder Command Center
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </h1>
            <p className="text-sm text-text-dim max-w-md leading-relaxed font-medium">
              Architect the next phase of the project. Polish raw thoughts, broadcast signals, and manage focus.
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-3 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Active Focus</p>
                  <p className={`text-xl font-black ${focusedCount >= 3 ? 'text-accent' : 'text-white'}`}>{focusedCount}/3</p>
                </div>
                <div className={`w-2 h-10 rounded-full ${focusedCount >= 3 ? 'bg-accent' : 'bg-white/10'}`} />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-12 items-start">
          
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-accent" />
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Publish New Request</h2>
              </div>
              
              <div className="bg-[#111] border border-white/10 rounded-[32px] p-6 md:p-8 space-y-6 shadow-2xl">
                <label className="block space-y-2">
                  <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-2">Raw Founder Input</span>
                  <textarea
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="Say what you want to build, change, or improve..."
                    className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-accent/40 resize-none placeholder:text-white/10 scrollbar-thin transition-colors"
                  />
                </label>
                
                <div className="flex justify-end gap-3">
                  {polishedResult && (
                    <button
                      onClick={() => setPolishedResult(null)}
                      className="px-6 py-3 bg-white/5 text-text-dim hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={handlePolish}
                    disabled={isPolishing || !rawInput.trim()}
                    className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50"
                  >
                    {isPolishing ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Zap size={16} fill="currentColor" />}
                    {polishedResult ? "Re-Polish Draft" : "Polish into Spec"}
                  </button>
                </div>
              </div>

              {polishedResult && (
                <div className="bg-accent/5 border border-accent/20 rounded-[32px] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 shadow-2xl shadow-accent/5">
                  <div className="flex items-center justify-between gap-4 border-b border-accent/10 pb-6">
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Spec Title</p>
                       {isEditing ? (
                         <input
                           type="text"
                           value={polishedResult.polished_title}
                           onChange={e => updateField('polished_title', e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xl font-black text-white focus:outline-none focus:border-accent/40"
                         />
                       ) : (
                         <h2 className="text-2xl font-black text-white uppercase tracking-tight">{polishedResult.polished_title}</h2>
                       )}
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`p-3 rounded-xl transition-all ${isEditing ? 'bg-accent text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <label className="block space-y-2">
                         <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">Context</span>
                         <textarea 
                           readOnly={!isEditing}
                           value={polishedResult.polished_context} 
                           onChange={e => updateField('polished_context', e.target.value)} 
                           className="w-full min-h-[120px] bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white/70 focus:outline-none focus:border-accent/40 resize-none transition-all" 
                         />
                       </label>
                    </div>
                    <div className="space-y-6">
                       <label className="block space-y-2">
                         <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">Requested Change</span>
                         <textarea 
                           readOnly={!isEditing}
                           value={polishedResult.polished_change} 
                           onChange={e => updateField('polished_change', e.target.value)} 
                           className="w-full min-h-[120px] bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-accent/40 resize-none transition-all" 
                         />
                       </label>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-accent/10">
                    <div className="flex flex-wrap gap-3">
                       <select 
                         value={polishedResult.type} 
                         onChange={e => updateField('type', e.target.value)}
                         className="bg-black/60 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-dim outline-none focus:border-accent/40"
                       >
                         {['App Improvement', 'New App Concept', 'UI Upgrade', 'Bug Fix', 'Growth Idea', 'Showcase'].map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                       <select 
                         value={polishedResult.priority} 
                         onChange={e => updateField('priority', e.target.value)}
                         className="bg-black/60 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-dim outline-none focus:border-accent/40"
                       >
                         {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p} Priority</option>)}
                       </select>
                    </div>
                    
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="w-full md:w-auto flex items-center justify-center gap-4 bg-accent text-white px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-accent/90 transition-all shadow-2xl shadow-accent/20 disabled:opacity-50"
                    >
                      {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                      Publish to Stream
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 pt-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio size={20} className="text-accent" />
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Active Build Stream</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                  {requests.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(req => (
                    <div key={req.id} className={`bg-[#111] border rounded-2xl p-4 flex items-center justify-between gap-6 transition-all hover:bg-[#151515] ${req.is_current_focus ? 'border-accent/40 ring-1 ring-accent/20' : 'border-white/5'}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-xs font-black uppercase tracking-wider truncate ${req.is_current_focus ? 'text-accent' : 'text-white'}`}>{req.polished_title}</h3>
                          <StatusBadge status={req.status} />
                        </div>
                        <p className="text-[10px] font-mono text-text-dim lowercase truncate">{req.polished_context}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          onClick={async () => {
                            try {
                              await toggleFocus(req.id);
                            } catch (e: any) {
                              error(e.message);
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            req.is_current_focus 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                              : 'bg-accent/5 text-accent border-accent/20 hover:bg-accent/20'
                          }`}
                        >
                          <Target size={12} />
                          {req.is_current_focus ? 'Unfocus' : 'Focus'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <aside className="space-y-12">
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Radio size={20} className="text-accent" />
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Daily Signal</h2>
                </div>
                
                <div className="bg-[#111] border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl">
                   <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">Broadcast to all builders</p>
                   <textarea
                     value={signalText}
                     onChange={(e) => setSignalText(e.target.value)}
                     placeholder="Good morning vibe coders. Today we focus on..."
                     className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-accent/40 resize-none placeholder:text-white/10 scrollbar-thin"
                   />
                   <button
                     disabled={isPostingSignal || !signalText.trim()}
                     onClick={handlePostSignal}
                     className="w-full flex items-center justify-center gap-3 bg-accent text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
                   >
                     {isPostingSignal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio size={14} />}
                     Broadcast Daily Signal
                   </button>
                </div>

                <div className="space-y-4 pt-6">
                  <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-4">Signal History</p>
                  <div className="space-y-3 max-h-[300px] overflow-auto scrollbar-none">
                     {dailySignals.map((s, i) => (
                       <div key={s.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                          <p className="text-xs text-white/80 leading-relaxed italic">"{s.message}"</p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-text-dim">
                             <span className="flex items-center gap-2"><Clock size={10} /> {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}</span>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
