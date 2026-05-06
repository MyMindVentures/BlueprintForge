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
      toast.warn("App concept required.");
      return;
    }
    if (!llmSettings.openRouterApiKey) {
      toast.error("Config missing: OpenRouter Key.");
      return;
    }

    onUpdate({ rawConcept: inputValue });
    
    try {
      await runPipeline(project.id, () => {
        if (project.autoGenerateImages) {
          runImagePipeline(project.id);
        }
      });
      toast.success("Pipeline engaged.");
    } catch (e: any) {
      toast.error(`Pipeline aborted: ${e.message}`);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Copy failed.");
    }
  };

  const handleDownload = () => {
    if (!project.markdownExport) return;
    downloadTextFile(`${project.name.toLowerCase().replace(/\s+/g, '_')}_spec.md`, project.markdownExport);
    toast.success("Documentation exported.");
  };

  const tabs = [
    { id: "input", label: "Parameters", disabled: false },
    { id: "cards", label: "Structure", disabled: !project.cardStructure },
    { id: "markdown", label: "Spec", disabled: !project.cardStructure },
    { id: "polished", label: "Polished", disabled: !project.polishedConcept },
    { id: "validation", label: "Audit", disabled: !project.validationReport },
    { id: "strategy", label: "Strategy", disabled: !project.strategyReport },
    { id: "ux", label: "Experience", disabled: !project.uxReport },
    { id: "architecture", label: "Engine", disabled: !project.architectureReport },
    { id: "images", label: "Visuals", disabled: !project.cardStructure },
  ].filter(tab => tab.id === "input" || tab.id === "cards" || tab.id === "markdown" || !tab.disabled);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ProjectHeader 
        projectName={project.name} 
        onBack={onBack} 
        onSave={() => { onUpdate({ rawConcept: inputValue }); toast.success("Snapshot saved."); }} 
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
            if (confirm("This will replace the current Raw Concept input. Continue?")) {
              setInputValue(project.polishedConcept!);
              onUpdate({ rawConcept: project.polishedConcept! });
              toast.success("Polished concept copied to Raw Input. You can now edit or add extras before generating specs again.", 5000);
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
