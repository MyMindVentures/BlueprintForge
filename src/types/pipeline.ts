export interface PipelineStep {
  id: string;
  name: string;
  agentCode: string;
  status: "Idle" | "Running" | "Success" | "Failed";
  startedAt?: string;
  finishedAt?: string;
  message: string;
  error?: string | null;
}

export interface PipelineLog {
  timestamp: string;
  step: string;
  message: string;
}

export interface PipelineJob {
  status: "Idle" | "Running" | "Success" | "Failed";
  currentStepId: string | null;
  steps: PipelineStep[];
  logs: PipelineLog[];
}
