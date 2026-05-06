import { tx } from '../../i18n/I18nProvider';
import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Project, AIAgent, LLMSettings } from "../../types";
import { useToast } from "../ui/Toast";
import { PipelineProgressOverlay } from "../pipeline/PipelineProgressOverlay";
import { ImagePipelineProgressOverlay } from "../pipeline/ImagePipelineProgressOverlay";
import { ProjectHeader } from "./ProjectHeader";
import { RawConceptPanel } from "./RawConceptPanel";
import { ProjectOutputTabs } from "./ProjectOutputTabs";
import { downloadTextFile } from "../../utils/download";

interface ProjectWorkspaceProps {
  project: Project;
  agents: AIAgent[];
  llmSettings: LLMSettings;
  onUpdate: (updates: Partial<Project>) => void;
  onBack: () => void;
  runPipeline: (id: string, onSuccess?: () => void) => Promise<void>;
  runImagePipeline: (id: string) => Promise<void>;
}

/**
 * Handles the project workspace workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function ProjectWorkspace({ project, agents, llmSettings, onUpdate, onBack, runPipeline, runImagePipeline }: ProjectWorkspaceProps) {
  const toast = useToast();
  const [inputValue, setInputValue] = useState(project.rawConcept);
  const [activeTab, setActiveTab] = useState<"input" | "cards" | "markdown" | "validation" | "strategy" | "ux" | "architecture" | "images" | "polished">("input");

  useEffect(() => {
    setInputValue(project.rawConcept);
  }, [project.id]);

  const handleGenerate = async () => {
    if (!inputValue.trim()) {
      toast.warn(tx("uiStrings.components.projects.projectworkspace.001"));
      return;
    }
    if (!llmSettings.openRouterApiKey) {
      toast.error(tx("uiStrings.components.projects.projectworkspace.002"));
      return;
    }

    onUpdate({ rawConcept: inputValue });
    
    try {
      await runPipeline(project.id, () => {
        if (project.autoGenerateImages) {
          runImagePipeline(project.id);
        }
      });
      toast.success(tx("uiStrings.components.projects.projectworkspace.003"));
    } catch (e: any) {
      toast.error(`Pipeline aborted: ${e.message}`);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(tx("uiStrings.components.projects.projectworkspace.004"));
    } catch {
      toast.error(tx("uiStrings.components.projects.projectworkspace.005"));
    }
  };

  const handleDownload = () => {
    if (!project.markdownExport) return;
    downloadTextFile(`${project.name.toLowerCase().replace(/\s+/g, '_')}_spec.md`, project.markdownExport);
    toast.success(tx("uiStrings.components.projects.projectworkspace.006"));
  };

  const tabs = [
    { id: "input", label:tx("uiStrings.components.projects.projectworkspace.007"), disabled: false },
    { id: "cards", label:tx("uiStrings.components.projects.projectworkspace.008"), disabled: !project.cardStructure },
    { id: "markdown", label:tx("uiStrings.components.projects.projectworkspace.009"), disabled: !project.cardStructure },
    { id: "polished", label:tx("uiStrings.components.projects.projectworkspace.010"), disabled: !project.polishedConcept },
    { id: "validation", label:tx("uiStrings.components.projects.projectworkspace.011"), disabled: !project.validationReport },
    { id: "strategy", label:tx("uiStrings.components.projects.projectworkspace.012"), disabled: !project.strategyReport },
    { id: "ux", label:tx("uiStrings.components.projects.projectworkspace.013"), disabled: !project.uxReport },
    { id: "architecture", label:tx("uiStrings.components.projects.projectworkspace.014"), disabled: !project.architectureReport },
    { id: "images", label:tx("uiStrings.components.projects.projectworkspace.015"), disabled: !project.cardStructure },
  ].filter(tab => tab.id === "input" || tab.id === "cards" || tab.id === "markdown" || !tab.disabled);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ProjectHeader 
        projectName={project.name} 
        onBack={onBack} 
        onSave={() => { onUpdate({ rawConcept: inputValue }); toast.success(tx("uiStrings.components.projects.projectworkspace.016")); }} 
        tabs={tabs}
        activeTab={activeTab as any}
        setActiveTab={setActiveTab as any}
      />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <RawConceptPanel 
          project={project}
          agents={agents}
          llmSettings={llmSettings}
          onUpdate={onUpdate}
          onGenerate={handleGenerate}
          inputValue={inputValue}
          setInputValue={setInputValue}
          isPipelineRunning={project.pipeline?.status === 'Running'}
          activeTab={activeTab as any}
        />
        
        <ProjectOutputTabs 
          project={project}
          activeTab={activeTab as any}
          onCopy={handleCopy}
          onDownload={handleDownload}
          runImagePipeline={() => runImagePipeline(project.id)}
          onUsePolishedConcept={() => {
            if (confirm(tx("uiStrings.components.projects.projectworkspace.017"))) {
              setInputValue(project.polishedConcept!);
              onUpdate({ rawConcept: project.polishedConcept! });
              toast.success(tx("uiStrings.components.projects.projectworkspace.018"), 5000);
            }
          }}
        />
      </main>

      <AnimatePresence>
        {project.pipeline && project.pipeline.status !== 'Idle' && (
          <PipelineProgressOverlay 
            job={project.pipeline} 
            onClose={() => {
              if (project.pipeline?.status === 'Success') setActiveTab('cards');
              onUpdate({ pipeline: { ...project.pipeline!, status: 'Idle' } });
            }} 
            onRetry={handleGenerate}
            onGenerateImages={() => runImagePipeline(project.id)}
          />
        )}
        {project.imagePipeline && project.imagePipeline.status !== 'Idle' && (
          <ImagePipelineProgressOverlay 
            pipeline={project.imagePipeline}
            onClose={() => {
               onUpdate({ imagePipeline: { ...project.imagePipeline!, status: 'Idle' } });
               setActiveTab('images');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
