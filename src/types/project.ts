import { CardNode } from "./card";
import { PipelineJob } from "./pipeline";

/**
 * Project status types.
 */
export type ProjectStatus = "Draft" | "Converted" | "Updated";

export interface ScreenImage {
  id: string;
  screenCode: string;
  screenTitle: string;
  prompt: string;
  imageUrl: string;
  status: "Pending" | "Generating" | "Ready" | "Failed";
  error: string | null;
  createdAt: string;
}

export interface ImagePipeline {
  status: "Idle" | "Running" | "Success" | "Failed";
  currentScreenCode: string | null;
  totalScreens: number;
  completedScreens: number;
  failedScreens: number;
  logs: any[]; // Using any[] for simplicity or could import PipelineLog if available
}

/**
 * A project in the workspace.
 */
export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  rawConcept: string;
  selectedAgentId: string | null;
  modelOverrideId: string | null;
  cardStructure: CardNode[] | null;
  markdownExport: string;
  validationReport?: string | null;
  optimizationNotes?: string | null;
  strategyReport?: string | null;
  uxReport?: string | null;
  architectureReport?: string | null;
  polishedConcept?: string | null;
  pipeline?: PipelineJob;
  autoGenerateImages?: boolean;
  screenImages?: ScreenImage[];
  imagePipeline?: ImagePipeline;
  createdAt: string;
  updatedAt: string;
}
