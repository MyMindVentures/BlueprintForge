export type VisionStatus = "Thinking" | "Testing" | "Building" | "Achieved";

export interface FounderVision {
  id: string;
  title: string;
  vision_statement: string;
  context: string;
  goal: string;
  status: VisionStatus;
  created_by: string;
  created_at: string;
}
