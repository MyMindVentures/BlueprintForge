-- Canonicalize founder/admin users to ROLE-01 while preserving existing builder users.
UPDATE users
SET role = 'ROLE-01', updated_at = now()
WHERE role IN ('admin', 'founder', 'architect', 'administrator');

-- Optional bootstrap founder user for fresh databases and manual checks. Real Firebase
-- sign-in still hydrates/updates the row identified by firebase_uid from auth state.
INSERT INTO users (id, name, role, auth_provider, is_demo)
VALUES ('admin-1', 'Founder', 'ROLE-01', 'bootstrap', TRUE)
ON CONFLICT (id) DO UPDATE SET role = 'ROLE-01', updated_at = now();
