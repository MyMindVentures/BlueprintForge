import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, RefreshCw, Copy, ExternalLink, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { Project, ScreenImage } from "../../types";
import { GlassCard } from "../ui/GlassCard";
import { ActionButton } from "../ui/ActionButton";

interface ScreenImageGalleryProps {
  project: Project;
  onRegenerateAll: () => Promise<void>;
  onRegenerateSingle: (screenCode: string) => Promise<void>;
}

export function ScreenImageGallery({ project, onRegenerateAll, onRegenerateSingle }: ScreenImageGalleryProps) {
  const images = project.screenImages || [];
  const pipeline = project.imagePipeline;
  const isRunning = pipeline?.status === "Running";

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    // Could add a toast here
  };

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_mockup.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (images.length === 0 && !isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 md:px-10 text-center space-y-6">
        <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center text-white/20">
          <ImageIcon size={40} />
        </div>
        <div className="space-y-2 max-w-sm">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Visual Interface Blueprint</h3>
          <p className="text-text-dim text-sm leading-relaxed">
            Generate high-fidelity screen UI mockups based on your technical specifications.
          </p>
        </div>
        <ActionButton 
          label="Generate Screen UI Images" 
          onClick={onRegenerateAll}
          variant="primary"
          className="w-full sm:w-auto !px-10 !py-4 !h-auto !rounded-2xl !text-[11px]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10 p-4 sm:p-6 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Screen Visuals</h2>
          <p className="text-xs text-text-dim font-medium uppercase tracking-widest opacity-60">
            {images.length} UI Concepts Generated
          </p>
        </div>
        <ActionButton 
          label="Regenerate All Images" 
          onClick={onRegenerateAll}
          variant="primary"
          className="w-full sm:w-auto !px-6 !py-2.5 sm:!h-auto !h-12 !rounded-xl !text-[9px]"
          icon={<RefreshCw size={14} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((image) => (
          <GlassCard key={image.id} className="group overflow-hidden flex flex-col h-full bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all duration-500">
            {/* Image Preview */}
            <div className="relative aspect-video bg-black/40 overflow-hidden border-b border-white/5">
              {image.status === "Ready" ? (
                <>
                  <img 
                    src={image.imageUrl} 
                    alt={image.screenTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button 
                      onClick={() => window.open(image.imageUrl, '_blank')}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transform hover:scale-110"
                      title="View Full Size"
                    >
                      <ExternalLink size={18} />
                    </button>
                    <button 
                      onClick={() => handleDownload(image.imageUrl, image.screenTitle)}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transform hover:scale-110"
                      title="Download Mockup"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </>
              ) : image.status === "Failed" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <AlertCircle size={32} className="text-red-500/50" />
                  <p className="text-[10px] text-red-400 font-mono uppercase font-bold tracking-tight line-clamp-3">
                    {image.error || "Generation Error"}
                  </p>
                  <button 
                    onClick={() => onRegenerateSingle(image.screenCode)}
                    className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Retry Generation
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={32} className="text-accent animate-spin" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent animate-pulse">Processing Pixel Data</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] font-mono font-black text-white/30 px-2 py-0.5 glass rounded-lg border border-white/5 uppercase tracking-widest bg-black/40">
                  {image.screenCode}
                </span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight truncate border-l border-white/10 pl-3">
                  {image.screenTitle}
                </h4>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleCopyPrompt(image.prompt)}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-dim hover:text-white transition-colors"
                >
                  <Copy size={12} />
                  Copy Prompt
                </button>
                <button 
                  onClick={() => onRegenerateSingle(image.screenCode)}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-dim hover:text-accent transition-colors"
                >
                  <RefreshCw size={12} />
                  Regenerate
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
