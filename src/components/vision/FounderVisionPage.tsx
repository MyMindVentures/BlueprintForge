import React, { useState } from 'react';
import { useVision } from '../../hooks/useVision';
import { useBuildFeed } from '../../hooks/useBuildFeed';
import { Compass, Send, CheckCircle2, FlaskConical, Target, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../ui/Toast';
import { VisionStatus } from '../../types/vision';

export function FounderVisionPage() {
  const { visions, publishVision } = useVision();
  const { currentUser } = useBuildFeed();
  const { success } = useToast();
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [expandedContexts, setExpandedContexts] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    title: '',
    vision_statement: '',
    context: '',
    goal: '',
    status: 'Thinking' as VisionStatus
  });

  const sortedVisions = [...visions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    
    publishVision({
      title: formData.title,
      vision_statement: formData.vision_statement,
      context: formData.context,
      goal: formData.goal,
      status: formData.status,
      created_by: currentUser?.id || ''
    });
    
    setFormData({
      title: '',
      vision_statement: '',
      context: '',
      goal: '',
      status: 'Thinking'
    });
    
    setIsPublishing(false);
    success("Vision published successfully");
  };

  const getStatusIcon = (status: VisionStatus) => {
    switch (status) {
      case 'Thinking': return <BrainCircuit className="w-3.5 h-3.5" />;
      case 'Testing': return <FlaskConical className="w-3.5 h-3.5" />;
      case 'Building': return <Target className="w-3.5 h-3.5" />;
      case 'Achieved': return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: VisionStatus) => {
    switch (status) {
      case 'Thinking': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Testing': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Building': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Achieved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const toggleContext = (id: string) => {
    setExpandedContexts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0A0A0A] p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="text-center space-y-4 mb-16">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Compass className="w-8 h-8 text-white/80" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em]">Founder Vision</h1>
          <p className="text-sm text-text-dim max-w-xl mx-auto leading-relaxed">
            High-signal strategic direction. How this platform will evolve, what we are trying to build, and why it matters. 
          </p>
        </header>

        {currentUser?.role === 'admin' && (
          <form onSubmit={handleSubmit} className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">Draft New Vision</h2>
            
            <div className="space-y-4">
              <input
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title (e.g. The Next Era of Builder Networks)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-accent/50 placeholder:text-white/20"
              />
              
              <textarea
                required
                value={formData.vision_statement}
                onChange={e => setFormData({ ...formData, vision_statement: e.target.value })}
                placeholder="Core Vision Statement (Short & powerful)"
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white/90 focus:outline-none focus:border-accent/50 placeholder:text-white/20 resize-none"
              />

              <input
                required
                value={formData.goal}
                onChange={e => setFormData({ ...formData, goal: e.target.value })}
                placeholder="Goal / Direction (What action does this drive?)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 placeholder:text-white/20"
              />
              
              <textarea
                value={formData.context}
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                placeholder="Broader Context & Why (Optional)"
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-accent/50 placeholder:text-white/20 resize-none"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-text-dim">Status:</span>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as VisionStatus })}
                    className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent/50 appearance-none"
                  >
                    <option value="Thinking">Thinking</option>
                    <option value="Testing">Testing</option>
                    <option value="Building">Building</option>
                    <option value="Achieved">Achieved</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={isPublishing || !formData.title || !formData.vision_statement || !formData.goal}
                  className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors shadow-lg disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Vision
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-8">
          {sortedVisions.length === 0 ? (
            <div className="text-center py-20 bg-[#111]/50 border border-white/5 rounded-3xl">
              <p className="text-text-dim font-black uppercase tracking-widest text-xs">No visions published yet.</p>
            </div>
          ) : (
            sortedVisions.map(vision => (
              <article key={vision.id} className="group relative bg-[#111] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight max-w-[80%]">{vision.title}</h2>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 ${getStatusColor(vision.status)}`}>
                    {getStatusIcon(vision.status)}
                    <span>{vision.status}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-white/90 font-medium leading-relaxed">
                    {vision.vision_statement}
                  </p>

                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 inline-block min-w-[50%]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Direction / Goal</p>
                    <p className="text-sm text-white/80">{vision.goal}</p>
                  </div>

                  {vision.context && (
                    <div className="pt-2">
                       <button 
                         onClick={() => toggleContext(vision.id)}
                         className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
                       >
                         {expandedContexts[vision.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                         Context & Thinking
                       </button>
                       {expandedContexts[vision.id] && (
                         <div className="mt-4 text-sm text-white/60 leading-relaxed bg-black/20 p-5 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-2">
                           {vision.context.split('\n').map((paragraph, i) => (
                             <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                           ))}
                         </div>
                       )}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-text-dim">
                    {formatDistanceToNow(new Date(vision.created_at), { addSuffix: true })}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
