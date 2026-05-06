import { BuildStatus, BuildPriority, BuildDifficulty, BuildType } from './buildFeed';

export interface AppVersion {
  id: string;
  version: string;
  release_title: string;
  release_notes: string;
  new_features: string[];
  fixed_issues: string[];
  known_limitations: string[];
  github_release_url?: string;
  created_at: string;
  published_by: string;
}

export interface GuideSection {
  id: string;
  title: string;
  content: string;
  related_page?: string;
  order: number;
}

export interface UserFlowStep {
  step: number;
  label: string;
  page: string;
  action: string;
  expected_result: string;
}

export interface UserFlow {
  id: string;
  title: string;
  description: string;
  steps: UserFlowStep[];
  related_pages: string[];
}

export interface DemoRecording {
  id: string;
  version: string;
  filename: string;
  file_url: string;
  duration: number;
  created_by: string;
  created_at: string;
}

export interface DemoSession {
  id: string;
  version: string;
  status: 'idle' | 'running' | 'recording' | 'completed' | 'failed';
  selected_flows: string[];
  is_recording: boolean;
  created_by: string;
  created_at: string;
  completed_at?: string;
}
