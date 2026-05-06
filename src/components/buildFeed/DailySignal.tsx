import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Send, Clock, Quote } from 'lucide-react';
import { DailySignal as DailySignalType } from '../../types/buildFeed';

interface DailySignalProps {
  signals: DailySignalType[];
  isAdmin: boolean;
  onPostSignal: (message: string) => void;
}

/**
 * Handles the daily signal workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function DailySignal({ signals, isAdmin, onPostSignal }: DailySignalProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState('');

  const latestSignal = signals[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onPostSignal(message);
    setMessage('');
    setIsPosting(false);
  };

  return (
    <div className="bg-[#111111]/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
      <div className="p-6 md:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
              <Radio size={20} className="text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Daily Signal</h2>
              <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-0.5">Founders Broadcast</p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsPosting(!isPosting)}
              className="text-[10px] font-black text-accent uppercase tracking-widest hover:text-white transition-colors"
            >
              {isPosting ? 'Cancel' : 'Post Signal'}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isPosting ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What should builders focus on today?"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 transition-colors min-h-[100px] resize-none"
                autoFocus
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={14} />
                  Publish
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {latestSignal ? (
                <div className="flex gap-6">
                  <div className="hidden md:block">
                    <Quote size={40} className="text-white/5" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-lg md:text-xl text-white font-medium leading-relaxed italic tracking-tight">
                      "{latestSignal.message}"
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-text-dim font-bold uppercase tracking-widest">
                       <div className="flex items-center gap-1.5">
                         <Clock size={12} />
                         <span>{new Date(latestSignal.created_at).toLocaleDateString()}</span>
                       </div>
                       <span>— The Architect</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-sm text-text-dim italic">Waiting for today's signal...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
