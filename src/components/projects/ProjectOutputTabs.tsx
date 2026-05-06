import { tx } from '../../i18n/I18nProvider';
import React from "react";
import { Copy, Download } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from "motion/react";
import { Project } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { RotateCcw } from "lucide-react";
import { NestedCardTree } from "../cards/NestedCardTree";
import { ScreenImageGallery } from "./ScreenImageGallery";

interface ProjectOutputTabsProps {
  project: Project;
  activeTab: string;
  onCopy: (text: string) => void;
  onDownload: () => void;
  runImagePipeline: () => Promise<void>;
  onUsePolishedConcept?: () => void;
}

/**
 * Handles the project output tabs workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function ProjectOutputTabs({ project, activeTab, onCopy, onDownload, runImagePipeline, onUsePolishedConcept }: ProjectOutputTabsProps) {
  
  if (activeTab === 'input') {
    return (
      <div className="hidden lg:flex flex-1 items-center justify-center bg-black/40">
        <EmptyState 
           icon={RotateCcw} 
           title={tx("uiLegacy.components.projects.projectoutputtabs.001")} 
           description={tx("uiLegacy.components.projects.projectoutputtabs.002")} 
        />
      </div>
    );
  }

  if (activeTab === 'cards') {
    return (
      <section className="flex-1 flex flex-col bg-white/[0.01]">
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-10 scrollbar-thin">
           {!project.cardStructure || project.cardStructure.length === 0 ? (
             <EmptyState 
               icon={RotateCcw} 
               title={tx("uiLegacy.components.projects.projectoutputtabs.003")} 
               description={tx("uiLegacy.components.projects.projectoutputtabs.004")} 
             />
           ) : (
             <div className="max-w-4xl mx-auto pb-20">
               <NestedCardTree nodes={project.cardStructure} />
             </div>
           )}
        </div>
      </section>
    );
  }

  if (activeTab === 'images') {
    return (
      <section className="flex-1 flex flex-col bg-black/40 overflow-hidden">
        <div className="flex-1 overflow-auto scrollbar-thin">
          <ScreenImageGallery 
            project={project} 
            onRegenerateAll={runImagePipeline}
            onRegenerateSingle={async () => { /* Logic for single regeneration if implemented */ }}
          />
        </div>
      </section>
    );
  }

  const getContent = () => {
    switch (activeTab) {
      case 'markdown': return project.markdownExport;
      case 'validation': return project.validationReport;
      case 'strategy': return project.strategyReport;
      case 'ux': return project.uxReport;
      case 'architecture': return project.architectureReport;
      case 'polished': return project.polishedConcept;
      default: return "";
    }
  };

  const content = getContent();

  return (
    <section className="flex-1 flex flex-col bg-black/40 overflow-hidden">
      <div className="h-10 flex items-center justify-end px-6 border-b border-white/5 bg-white/[0.01]">
         {content && (activeTab === 'markdown' || activeTab === 'polished') && (
           <div className="flex items-center gap-2">
              <button 
                onClick={() => onCopy(content)}
                className="text-[9px] font-black uppercase tracking-widest text-text-dim hover:text-accent flex items-center gap-1.5 transition-colors"
                title={tx("uiLegacy.components.projects.projectoutputtabs.005")}
              >
                <Copy size={12} />{tx("uiLegacy.components.projects.projectoutputtabs.006")}</button>
              
              {activeTab === 'polished' && onUsePolishedConcept && (
                <>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <button 
                    onClick={onUsePolishedConcept}
                    className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
                    title={tx("uiLegacy.components.projects.projectoutputtabs.007")}
                  >
                    <RotateCcw size={12} />{tx("uiLegacy.components.projects.projectoutputtabs.008")}</button>
                </>
              )}

              {activeTab === 'markdown' && (
                <>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <button 
                    onClick={onDownload}
                    className="text-[9px] font-black uppercase tracking-widest text-text-dim hover:text-accent flex items-center gap-1.5 transition-colors"
                    title={tx("uiLegacy.components.projects.projectoutputtabs.009")}
                  >
                    <Download size={12} />{tx("uiLegacy.components.projects.projectoutputtabs.010")}</button>
                </>
              )}
           </div>
         )}
      </div>
      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-10 scrollbar-thin">
        <div className="max-w-3xl mx-auto pb-24">
           {!content ? (
             <EmptyState 
               icon={RotateCcw} 
               title={activeTab === 'polished' ?tx("uiStrings.components.projects.projectoutputtabs.001") :tx("uiStrings.components.projects.projectoutputtabs.002")} 
               description={activeTab === 'polished' ?tx("uiStrings.components.projects.projectoutputtabs.003") :tx("uiStrings.components.projects.projectoutputtabs.004")} 
             />
           ) : (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="markdown-body">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {content}
               </ReactMarkdown>
             </motion.div>
           )}
        </div>
      </div>
    </section>
  );
}
