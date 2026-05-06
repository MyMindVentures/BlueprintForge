export type BuildPriority = "Low" | "Medium" | "High" | "Critical";
export type BuildDifficulty = "Easy" | "Medium" | "Hard";
export type BuildStatus = "Open" | "Claimed" | "In Progress" | "Ready for Review" | "Accepted" | "Done" | "Needs Changes" | "Rejected";
export type BuildType = "App Improvement" | "New App Concept" | "UI Upgrade" | "Bug Fix" | "Growth Idea" | "Showcase";
export type ProfileStatus = "Incomplete Profile" | "Active Builder" | "Verified Builder";

export interface BuildRequest {
  id: string;
  raw_input: string;
  polished_title: string;
  polished_context: string;
  polished_change: string;
  polished_ui_ux: string;
  acceptance_criteria: string[];
  priority: BuildPriority;
  difficulty: BuildDifficulty;
  type: BuildType;
  status: BuildStatus;
  created_by: string;
  claimed_by: string | null;
  claimed_by_profile_id: string | null;
  created_at: string;
  claimed_at: string | null;
  updated_at: string;
  
  // Bootstrap Page specific fields
  ticket_problem?: string;
  ticket_goal?: string;
  ticket_expected_behavior?: string;
  ticket_ui_ux_requirements?: string;
  ticket_technical_notes?: string;
  
  // GitHub Integration
  github_issue_url?: string | null;
  github_issue_number?: number | null;
  github_repo_url?: string | null;
  github_sync_status?: "pending" | "success" | "failed" | null;
  github_created_at?: string | null;
  
  // Implementation
  implementation_pr_url?: string | null;
  implementation_notes?: string | null;
  accepted_by?: string | null;
  accepted_at?: string | null;

  // Next Action Layer (Focus)
  is_current_focus?: boolean;
  focus_reason?: string | null;
  focus_order?: number | null;
  focus_set_at?: string | null;
}

export interface DailySignal {
  id: string;
  message: string;
  created_by: string;
  created_at: string;
}

export interface BuildRequestUpdate {
  id: string;
  build_request_id: string;
  user_id: string;
  profile_id: string | null;
  update_text: string;
  created_at: string;
}

export interface VibeCoderProfile {
  id: string;
  user_id: string;
  name: string;
  username: string;
  email: string;
  country: string;
  timezone: string;
  skills: string;
  preferred_stack: string;
  portfolio_url: string;
  github_url: string;
  twitter_url: string;
  availability: string;
  looking_for_paid_work: boolean;
  bio: string;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
  
  // Stats & Rep
  stars_count: number;
  completed_requests_count: number;
  implemented_feed_count: number;
  github_prs_count: number;
  verified_github_username?: string | null;
}

export interface BuilderStarEvent {
  id: string;
  profile_id: string;
  build_request_id: string;
  awarded_by: string;
  reason: string;
  created_at: string;
}

export interface GithubSettings {
  repo_url: string;
  repo_owner: string;
  repo_name: string;
  github_token: string;
  auto_create_issues: boolean;
}

export interface UserContext {
  id: string;
  name: string;
  role: "admin" | "vibe_coder" | "anonymous";
  acknowledged_versions?: string[];
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: "version_deployed" | "general" | string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export const DEMO_USERS: UserContext[] = [
  { id: "admin-1", name: "Founder", role: "admin" },
  { id: "coder-1", name: "Vibe Coder Alex", role: "vibe_coder" },
  { id: "coder-2", name: "Vibe Coder Sam", role: "vibe_coder" },
  { id: "anon-1", name: "Public Visitor", role: "anonymous" }
];
