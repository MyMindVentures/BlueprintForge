import { useCallback } from "react";
import { Project, AIAgent, PipelineStep, PipelineJob, LLMSettings } from "../types";
import { runAgentStep } from "../services/agentService";
import { getShortTime, getCurrentTimestamp } from "../utils/time";
import { apiRequest } from "../services/apiClient";

/**
 * Handles the use pipeline workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function usePipeline(
  projects: Project[],
  setProjects: (p: Project[] | ((prev: Project[]) => Project[])) => void,
  agents: AIAgent[],
  llmSettings: LLMSettings
) {
  const runPipeline = async (projectId: string, onSuccess?: () => void) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const apiKey = llmSettings.openRouterApiKey;
    if (!apiKey) throw new Error("API Key missing.");

    let overrideId = project.modelOverrideId;
    if (overrideId === "anthropic/claude-3.5-sonnet") overrideId = "anthropic/claude-3.7-sonnet";
    
    let defaultId = llmSettings.defaultModelId;
    if (defaultId === "anthropic/claude-3.5-sonnet") defaultId = "anthropic/claude-3.7-sonnet";

    const modelId = overrideId || defaultId || "openai/gpt-4o-mini";

    const steps: PipelineStep[] = [
      { id: "step1", name: "Structured Spec", agentCode: "AGENT-01", status: "Idle", message: "Analyzing concept and building structure..." },
      { id: "step2", name: "Validation", agentCode: "AGENT-02", status: "Idle", message: "Checking for inconsistencies..." },
      { id: "step3", name: "Optimization", agentCode: "AGENT-04", status: "Idle", message: "Improving architecture..." },
      { id: "step4", name: "Markdown Finalization", agentCode: "AGENT-03", status: "Idle", message: "Formatting output..." },
      { id: "step5", name: "Polished Concept", agentCode: "AGENT-05", status: "Idle", message: "Writing polished version..." }
    ];

    const initialJob: PipelineJob = {
      status: "Running",
      currentStepId: "step1",
      steps,
      logs: [{ timestamp: getShortTime(), step: "SYSTEM", message: "Initiating pipeline..." }]
    };

    const updateProjectPostgres = async (id: string, updates: Partial<Project>) => {
      await apiRequest('/api/workspace/projects/' + id, { method: 'PATCH', body: JSON.stringify({ data: { ...updates, updatedAt: new Date().toISOString() } }) });
      setProjects(prev => prev.map(project => project.id === id ? { ...project, ...updates, updatedAt: new Date().toISOString() } : project));
    };

    const getLatestProject = async (id: string) => projects.find(project => project.id === id) || null;

    await updateProjectPostgres(projectId, { pipeline: initialJob });

    const log = async (step: string, message: string) => {
      const latest = await getLatestProject(projectId);
      if (latest?.pipeline) {
        await updateProjectPostgres(projectId, {
          pipeline: {
            ...latest.pipeline,
            logs: [...latest.pipeline.logs, { timestamp: getShortTime(), step, message }]
          }
        });
      }
    };

    const setStepStatus = async (stepId: string, status: PipelineStep["status"], msg?: string, error?: string) => {
      const latest = await getLatestProject(projectId);
      if (latest?.pipeline) {
        const nextSteps = latest.pipeline.steps.map(s => 
          s.id === stepId ? { 
            ...s, 
            status, 
            message: msg || s.message, 
            error, 
            finishedAt: status === "Success" || status === "Failed" ? getCurrentTimestamp() : s.finishedAt, 
            startedAt: status === "Running" ? getCurrentTimestamp() : s.startedAt 
          } : s
        );
        await updateProjectPostgres(projectId, {
          pipeline: {
            ...latest.pipeline,
            steps: nextSteps,
            currentStepId: status === "Running" ? stepId : latest.pipeline.currentStepId
          }
        });
      }
    };

    try {
      await setStepStatus("step1", "Running");
      await log("AGENT-01", "Starting analysis...");
      const res01 = await runAgentStep({ rawConcept: project.rawConcept, agent: agents.find(a => a.code === "AGENT-01")!, openRouterApiKey: apiKey, modelId });
      await updateProjectPostgres(projectId, { cardStructure: res01.app.sections, markdownExport: res01.app.markdown, status: "Converted" });
      await setStepStatus("step1", "Success", "Structure mapped.");

      await setStepStatus("step2", "Running");
      await log("AGENT-02", "Validating...");
      const res02 = await runAgentStep({ rawConcept: `Spec: ${res01.app.markdown}`, agent: agents.find(a => a.code === "AGENT-02")!, openRouterApiKey: apiKey, modelId });
      await updateProjectPostgres(projectId, { validationReport: res02.app.markdown });
      await setStepStatus("step2", "Success", "Validation complete.");

      await setStepStatus("step3", "Running");
      const res03 = await runAgentStep({ rawConcept: `Improve this: ${res01.app.markdown}`, agent: agents.find(a => a.code === "AGENT-04")!, openRouterApiKey: apiKey, modelId });
      await updateProjectPostgres(projectId, { cardStructure: res03.app.sections, markdownExport: res03.app.markdown });
      await setStepStatus("step3", "Success");

      await setStepStatus("step4", "Running");
      const res04 = await runAgentStep({ rawConcept: `Finalize markdown: ${JSON.stringify(res03.app.sections)}`, agent: agents.find(a => a.code === "AGENT-03")!, openRouterApiKey: apiKey, modelId });
      await updateProjectPostgres(projectId, { markdownExport: res04.app.markdown });
      await setStepStatus("step4", "Success");

      await setStepStatus("step5", "Running");
      await log("AGENT-05", "Writing polished concept...");
      const polishedConceptPrompt = `Based on the original raw concept:\n\n${project.rawConcept}\n\nGenerated Markdown Spec:\n\n${res04.app.markdown}\n\nValidation Report:\n\n${res02.app.markdown}\n\nOptimization Notes:\n\n${res03.app.markdown}\n\nCard Structure:\n\n${JSON.stringify(res03.app.sections, null, 2)}\n\nRewrite the original raw concept into a clear, professional, and comprehensive project brief.`;
      const res05 = await runAgentStep({ rawConcept: polishedConceptPrompt, agent: agents.find(a => a.code === "AGENT-05")!, openRouterApiKey: apiKey, modelId });
      await updateProjectPostgres(projectId, { polishedConcept: res05.app.markdown });
      await setStepStatus("step5", "Success", "Polished concept generated.");
      
      const last = await getLatestProject(projectId);
      if (last?.pipeline) {
        await updateProjectPostgres(projectId, {
          pipeline: { ...last.pipeline, status: "Success", currentStepId: null }
        });
      }
      await log("SYSTEM", "Pipeline complete.");

      if (onSuccess) onSuccess();
    } catch (e: any) {
      await log("SYSTEM", `ERROR: ${e.message}`);
      const last = await getLatestProject(projectId);
      if (last?.pipeline) {
        const stepId = last.pipeline.currentStepId;
        const nextSteps = last.pipeline.steps.map(s => s.id === stepId ? { ...s, status: "Failed" as const, error: e.message } : s);
        await updateProjectPostgres(projectId, {
          pipeline: { ...last.pipeline, steps: nextSteps, status: "Failed" as const }
        });
      }
      throw e;
    }
  };

  return { runPipeline };
}
