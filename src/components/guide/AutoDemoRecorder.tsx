import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Zap, Cpu, Target, Users, Github, ArrowRight, 
  Terminal, Monitor, X, Play, Square, Loader2, 
  ChevronRight, Sparkles, MessageSquare, Code2, Rocket, Video
} from 'lucide-react';
import { useGuide } from '../../hooks/useGuide';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { isFounderAdminRole, normalizeRole } from '../../authRoles';

interface AutoDemoRecorderProps {
  onExit: () => void;
}

/**
 * Handles the auto demo recorder workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function AutoDemoRecorder({ onExit }: AutoDemoRecorderProps) {
  const { flows, latestVersion, startDemoSession, completeDemoSession } = useGuide();
  const { profile } = useAuth();
  const { success, info, error } = useToast();
  
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'running' | 'recording' | 'finished'>('setup');
  const [currentFlowIdx, setCurrentFlowIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const hasFounderAccess = isFounderAdminRole(profile?.role);

  const startDemo = async (record: boolean) => {
    if (!hasFounderAccess) {
      error(`Demo recorder requires ROLE-01. Resolved role: ${normalizeRole(profile?.role)}.`);
      return;
    }
    if (record) {
      try {
        const stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: true,
          audio: false
        });
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8,opus'
        });
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const filename = `blueprintforge-auto-demo-v${latestVersion.version}-${new Date().toISOString().split('T')[0]}.webm`;
          
          completeDemoSession({
            version: latestVersion.version,
            filename,
            file_url: url,
            duration: timer,
            created_by: 'admin'
          });
          
          stream.getTracks().forEach((track: any) => track.stop());
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        startTimer();
      } catch (err: any) {
        console.error("Recording failed", err);
        if (err.name === 'NotAllowedError' || err.message.includes('disallowed')) {
          error("Screen recording is blocked. Try opening the app in a new tab or use 'Preview Mode'.");
        } else {
          error(`Recording failed: ${err.message}`);
        }
        setPhase('setup');
        return;
      }
    }
    
    setPhase('running');
    startDemoLogic();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopDemo = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setPhase('finished');
  };

  const currentFlow = flows[currentFlowIdx];
  const currentStep = currentFlow?.steps[currentStepIdx];

  const startDemoLogic = () => {
    // Logic to move between steps with timeouts
    const runNextStep = () => {
      if (currentStepIdx < currentFlow.steps.length - 1) {
        setCurrentStepIdx(prev => prev + 1);
      } else if (currentFlowIdx < flows.length - 1) {
        setCurrentFlowIdx(prev => prev + 1);
        setCurrentStepIdx(0);
      } else {
        stopDemo();
      }
    };

    // Auto-advance logic simulation
    const interval = setInterval(() => {
      if (phase === 'running' || phase === 'recording') {
         runNextStep();
      } else {
         clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050505]/95 backdrop-blur-2xl"
    >
      <div className="max-w-4xl w-full bg-[#111] border border-white/10 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(255,107,0,0.1)]">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                 <Terminal size={20} />
              </div>
              <div>
                 <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Auto Demo Engine</h2>
                 <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-1">Platform Walkthrough v{latestVersion.version}</p>
              </div>
           </div>
           <button 
             onClick={onExit}
             className="p-3 rounded-full hover:bg-white/5 text-text-dim transition-colors"
           >
              <X size={20} />
           </button>
        </div>

        <div className="p-12 space-y-12">
          {phase === 'setup' && (
            <div className="space-y-12 text-center py-12">
               {!hasFounderAccess && (
                 <div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                   Demo Recorder is a ROLE-01 protected admin tool. Resolved role: <span className="font-mono">{normalizeRole(profile?.role)}</span>.
                 </div>
               )}
               <div className="space-y-4">
                 <h3 className="text-4xl font-black text-white uppercase tracking-tight">Ready to Record?</h3>
                 <p className="text-text-dim max-w-lg mx-auto leading-relaxed">
                   The system will launch an automated robot walkthrough of the platform. You can record the session into a high-quality video file.
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <button 
                    onClick={() => startDemo(true)}
                    disabled={!hasFounderAccess} className="p-8 bg-accent/10 border border-accent/20 rounded-3xl space-y-4 hover:bg-accent/20 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                     <Video size={32} className="text-accent mx-auto group-hover:scale-110 transition-transform" />
                     <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Full Recording</h4>
                        <p className="text-[10px] text-text-dim mt-1">Capture screen & robot steps</p>
                     </div>
                  </button>
                  <button 
                    onClick={() => startDemo(false)}
                    disabled={!hasFounderAccess} className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/10 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                     <Monitor size={32} className="text-white mx-auto group-hover:scale-110 transition-transform" />
                     <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Preview Mode</h4>
                        <p className="text-[10px] text-text-dim mt-1">Robot walkthrough only</p>
                     </div>
                  </button>
               </div>
            </div>
          )}

          {(phase === 'running' || phase === 'recording') && (
            <div className="space-y-12 py-12">
               <div className="flex items-center justify-between px-8 py-4 bg-black/40 border border-white/5 rounded-3xl">
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{isRecording ? 'Recording' : 'Running'}</span>
                     </div>
                     <div className="h-6 w-px bg-white/10" />
                     <div className="text-[10px] font-mono text-text-dim">
                        FLOW: <span className="text-white">{currentFlowIdx + 1}/{flows.length}</span>
                     </div>
                     <div className="text-[10px] font-mono text-text-dim">
                        STEP: <span className="text-white">{currentStepIdx + 1}/{currentFlow.steps.length}</span>
                     </div>
                  </div>
                  {isRecording && (
                    <div className="text-sm font-mono text-accent font-black">
                      {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-center">
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Active Robot Signal</h4>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">"{currentStep.action}"</h3>
                     </div>
                     <div className="bg-white/5 border-l-4 border-accent p-6 rounded-r-3xl">
                        <p className="text-xl text-text-dim italic font-medium">"{currentStep.expected_result}"</p>
                     </div>
                  </div>
                  
                  <div className="bg-black/60 border border-white/5 rounded-[32px] p-8 space-y-6">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                           <Target size={16} />
                        </div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Robot Caption</h5>
                     </div>
                     <p className="text-sm text-text-dim leading-relaxed font-medium">
                        Navigating to <span className="text-white font-bold">{currentStep.page}</span> to demonstrate the <span className="text-accent font-black">{currentStep.label}</span> phase of the bootstrap loop.
                     </p>
                     <div className="flex items-center gap-2 pt-4">
                        <Loader2 className="w-4 h-4 text-accent animate-spin" />
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">AI Processing...</span>
                     </div>
                  </div>
               </div>

               <div className="flex justify-center">
                  <button 
                    onClick={stopDemo}
                    className="flex items-center gap-3 px-8 py-3 bg-red-500/10 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20"
                  >
                     <Square size={16} fill="currentColor" />
                     Force Stop Demo
                  </button>
               </div>
            </div>
          )}

          {phase === 'finished' && (
            <div className="text-center py-20 space-y-12">
               <div className="w-20 h-20 rounded-[32px] bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mx-auto">
                  <Rocket size={40} />
               </div>
               <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white uppercase tracking-tight">Demo Completed</h3>
                  <p className="text-text-dim max-w-lg mx-auto">
                    The robot has finished the walkthrough. If you were recording, your video file is being prepared for download.
                  </p>
               </div>
               <div className="flex justify-center gap-6">
                  <button 
                    onClick={onExit}
                    className="glass-btn-primary !px-12 !py-4"
                  >
                     Return to Guide
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
