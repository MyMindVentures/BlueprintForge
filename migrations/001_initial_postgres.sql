CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT UNIQUE,
  email TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'vibe_coder',
  auth_provider TEXT DEFAULT 'firebase',
  preferred_language TEXT NOT NULL DEFAULT 'en',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  demo_data_set_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS builder_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '', username TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '', timezone TEXT NOT NULL DEFAULT '', skills TEXT NOT NULL DEFAULT '', preferred_stack TEXT NOT NULL DEFAULT '',
  portfolio_url TEXT NOT NULL DEFAULT '', github_url TEXT NOT NULL DEFAULT '', twitter_url TEXT NOT NULL DEFAULT '', availability TEXT NOT NULL DEFAULT '',
  looking_for_paid_work BOOLEAN NOT NULL DEFAULT FALSE, bio TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Active Builder',
  stars_count INTEGER NOT NULL DEFAULT 0, completed_requests_count INTEGER NOT NULL DEFAULT 0, implemented_feed_count INTEGER NOT NULL DEFAULT 0,
  github_prs_count INTEGER NOT NULL DEFAULT 0, verified_github_username TEXT, is_demo BOOLEAN NOT NULL DEFAULT FALSE, demo_data_set_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS founder_visions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, vision_statement TEXT NOT NULL, context TEXT NOT NULL DEFAULT '', goal TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Thinking', created_by TEXT REFERENCES users(id), is_demo BOOLEAN NOT NULL DEFAULT FALSE, demo_data_set_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', owner_id TEXT REFERENCES users(id), status TEXT NOT NULL DEFAULT 'Draft', payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, demo_data_set_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS build_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), raw_input TEXT NOT NULL DEFAULT '', polished_title TEXT NOT NULL DEFAULT '', polished_context TEXT NOT NULL DEFAULT '',
  polished_change TEXT NOT NULL DEFAULT '', polished_ui_ux TEXT NOT NULL DEFAULT '', acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority TEXT NOT NULL DEFAULT 'Medium', difficulty TEXT NOT NULL DEFAULT 'Medium', type TEXT NOT NULL DEFAULT 'App Improvement', status TEXT NOT NULL DEFAULT 'Open',
  created_by TEXT REFERENCES users(id), claimed_by TEXT REFERENCES users(id), claimed_by_profile_id UUID REFERENCES builder_profiles(id), claimed_at TIMESTAMPTZ,
  ticket_problem TEXT, ticket_goal TEXT, ticket_expected_behavior TEXT, ticket_ui_ux_requirements TEXT, ticket_technical_notes TEXT,
  github_issue_url TEXT, github_issue_number INTEGER, github_repo_url TEXT, github_sync_status TEXT, github_created_at TIMESTAMPTZ,
  implementation_pr_url TEXT, implementation_notes TEXT, accepted_by TEXT REFERENCES users(id), accepted_at TIMESTAMPTZ,
  is_current_focus BOOLEAN NOT NULL DEFAULT FALSE, focus_reason TEXT, focus_order INTEGER, focus_set_at TIMESTAMPTZ,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, demo_data_set_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS build_request_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), build_request_id UUID NOT NULL REFERENCES build_requests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id), profile_id UUID REFERENCES builder_profiles(id), status TEXT NOT NULL DEFAULT 'active', claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(), released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), build_request_id UUID NOT NULL REFERENCES build_requests(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id), profile_id UUID REFERENCES builder_profiles(id), update_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS github_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), build_request_id UUID REFERENCES build_requests(id) ON DELETE SET NULL, issue_number INTEGER, issue_url TEXT NOT NULL,
  repo_url TEXT, status TEXT NOT NULL DEFAULT 'open', created_by TEXT REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), build_request_id UUID REFERENCES build_requests(id) ON DELETE SET NULL, profile_id UUID REFERENCES builder_profiles(id),
  pr_url TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'submitted', submitted_by TEXT REFERENCES users(id), reviewed_by TEXT REFERENCES users(id), reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), profile_id UUID NOT NULL REFERENCES builder_profiles(id) ON DELETE CASCADE,
  build_request_id UUID REFERENCES build_requests(id) ON DELETE SET NULL, awarded_by TEXT REFERENCES users(id), reason TEXT NOT NULL DEFAULT 'Completed Feed Request',
  is_removed BOOLEAN NOT NULL DEFAULT FALSE, removed_by TEXT REFERENCES users(id), removed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), message TEXT NOT NULL, created_by TEXT REFERENCES users(id), is_demo BOOLEAN NOT NULL DEFAULT FALSE, demo_data_set_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS current_focus_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), build_request_id UUID NOT NULL REFERENCES build_requests(id) ON DELETE CASCADE,
  reason TEXT, focus_order INTEGER, set_by TEXT REFERENCES users(id), active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, type TEXT NOT NULL DEFAULT 'general', title TEXT NOT NULL,
  message TEXT NOT NULL, link TEXT, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), version TEXT NOT NULL, release_title TEXT NOT NULL, release_notes TEXT NOT NULL DEFAULT '',
  new_features JSONB NOT NULL DEFAULT '[]'::jsonb, fixed_issues JSONB NOT NULL DEFAULT '[]'::jsonb, known_limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
  github_release_url TEXT, published_by TEXT REFERENCES users(id), created_by TEXT REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS version_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, version TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, version)
);

CREATE TABLE IF NOT EXISTS guide_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, content TEXT NOT NULL, related_page TEXT, section_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_id TEXT REFERENCES users(id), action TEXT NOT NULL, target_type TEXT, target_id TEXT, details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_data_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, created_by TEXT REFERENCES users(id), status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), version TEXT NOT NULL, status TEXT NOT NULL, selected_flows JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_recording BOOLEAN NOT NULL DEFAULT FALSE, created_by TEXT REFERENCES users(id), completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), demo_session_id UUID REFERENCES demo_sessions(id) ON DELETE SET NULL, version TEXT NOT NULL, filename TEXT NOT NULL,
  file_url TEXT NOT NULL, duration INTEGER NOT NULL DEFAULT 0, created_by TEXT REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', steps JSONB NOT NULL DEFAULT '[]'::jsonb, related_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT REFERENCES users(id), data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS agents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT REFERENCES users(id), data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS user_settings (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS github_settings (id TEXT PRIMARY KEY DEFAULT 'global', data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS idx_build_requests_status ON build_requests(status);
CREATE INDEX IF NOT EXISTS idx_build_requests_demo ON build_requests(is_demo, demo_data_set_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_version_ack_user_version ON version_acknowledgements(user_id, version);
