import { getDb, sqlValue } from '../db/postgres';
import { writeAuditLog } from './auditLogRepository';

const json = (value: any, fallback: any[] = []) => typeof value === 'string' ? JSON.parse(value) : (value ?? fallback);
const requestSelect = `id, raw_input, polished_title, polished_context, polished_change, polished_ui_ux, acceptance_criteria::text AS acceptance_criteria, priority, difficulty, type, status, created_by, claimed_by, claimed_by_profile_id::text, created_at, claimed_at, updated_at, ticket_problem, ticket_goal, ticket_expected_behavior, ticket_ui_ux_requirements, ticket_technical_notes, github_issue_url, github_issue_number, github_repo_url, github_sync_status, github_created_at, implementation_pr_url, implementation_notes, accepted_by, accepted_at, is_current_focus, focus_reason, focus_order, focus_set_at`;
const mapRequest = (r: any) => ({ ...r, acceptance_criteria: json(r.acceptance_criteria), id: String(r.id), claimed_by_profile_id: r.claimed_by_profile_id || null });
const mapProfile = (r: any) => ({ ...r, id: String(r.id), looking_for_paid_work: r.looking_for_paid_work === true || r.looking_for_paid_work === 't', stars_count: Number(r.stars_count || 0), completed_requests_count: Number(r.completed_requests_count || 0), implemented_feed_count: Number(r.implemented_feed_count || 0), github_prs_count: Number(r.github_prs_count || 0) });

export const buildRequestRepository = {
  async listAll() {
    const requests = await getDb().query(`SELECT ${requestSelect} FROM build_requests ORDER BY created_at DESC`);
    const updates = await getDb().query('SELECT id, build_request_id::text, user_id, profile_id::text, update_text, created_at FROM progress_updates ORDER BY created_at ASC');
    const profiles = await getDb().query('SELECT id::text, user_id, name, username, email, country, timezone, skills, preferred_stack, portfolio_url, github_url, twitter_url, availability, looking_for_paid_work, bio, status, created_at, updated_at, stars_count, completed_requests_count, implemented_feed_count, github_prs_count, verified_github_username FROM builder_profiles ORDER BY created_at DESC');
    const dailySignals = await getDb().query('SELECT id::text, message, created_by, created_at FROM daily_signals ORDER BY created_at DESC LIMIT 50');
    return { requests: requests.map(mapRequest), updates, profiles: profiles.map(mapProfile), dailySignals };
  },
  async publish(request: any, userId: string) {
    const rows = await getDb().query(`INSERT INTO build_requests (raw_input, polished_title, polished_context, polished_change, polished_ui_ux, acceptance_criteria, priority, difficulty, type, status, created_by, ticket_problem, ticket_goal, ticket_expected_behavior, ticket_ui_ux_requirements, ticket_technical_notes) VALUES (${sqlValue(request.raw_input || '')}, ${sqlValue(request.polished_title || '')}, ${sqlValue(request.polished_context || '')}, ${sqlValue(request.polished_change || '')}, ${sqlValue(request.polished_ui_ux || '')}, ${sqlValue(request.acceptance_criteria || [])}, ${sqlValue(request.priority || 'Medium')}, ${sqlValue(request.difficulty || 'Medium')}, ${sqlValue(request.type || 'App Improvement')}, 'Open', ${sqlValue(userId)}, ${sqlValue(request.ticket_problem)}, ${sqlValue(request.ticket_goal)}, ${sqlValue(request.ticket_expected_behavior)}, ${sqlValue(request.ticket_ui_ux_requirements)}, ${sqlValue(request.ticket_technical_notes)}) RETURNING id`);
    await writeAuditLog(userId, 'publish_build_request', 'build_request', rows[0].id, { title: request.polished_title });
    return rows[0].id;
  },
  async update(id: string, updates: any, actorId: string | null) {
    const allowed = ['status','github_issue_url','github_issue_number','github_repo_url','github_sync_status','github_created_at','implementation_pr_url','implementation_notes','accepted_by','accepted_at','is_current_focus','focus_reason','focus_order','focus_set_at'];
    const assignments = Object.entries(updates).filter(([key]) => allowed.includes(key)).map(([key, value]) => `${key} = ${sqlValue(value)}`);
    if (!assignments.length) return;
    await getDb().query(`UPDATE build_requests SET ${assignments.join(', ')}, updated_at = now() WHERE id = ${sqlValue(id)}`);
    if (updates.github_issue_url) await writeAuditLog(actorId, 'create_github_issue', 'build_request', id, updates);
  },
  async claim(id: string, userId: string, profileId: string) {
    await getDb().query('BEGIN');
    try {
      const rows = await getDb().query(`SELECT status FROM build_requests WHERE id = ${sqlValue(id)} FOR UPDATE`);
      if (!rows[0]) throw new Error('Ticket does not exist');
      if (rows[0].status !== 'Open') throw new Error('Ticket already claimed');
      await getDb().query(`UPDATE build_requests SET status = 'Claimed', claimed_by = ${sqlValue(userId)}, claimed_by_profile_id = ${sqlValue(profileId)}, claimed_at = now(), updated_at = now() WHERE id = ${sqlValue(id)}`);
      await getDb().query(`INSERT INTO build_request_claims (build_request_id, user_id, profile_id) VALUES (${sqlValue(id)}, ${sqlValue(userId)}, ${sqlValue(profileId)})`);
      await getDb().query(`INSERT INTO progress_updates (build_request_id, user_id, profile_id, update_text) VALUES (${sqlValue(id)}, ${sqlValue(userId)}, ${sqlValue(profileId)}, 'Ticket claimed by builder.')`);
      await getDb().query('COMMIT');
    } catch (error) { await getDb().query('ROLLBACK'); throw error; }
  },
  async postUpdate(buildRequestId: string, userId: string, profileId: string | null, text: string) {
    await getDb().query(`INSERT INTO progress_updates (build_request_id, user_id, profile_id, update_text) VALUES (${sqlValue(buildRequestId)}, ${sqlValue(userId)}, ${sqlValue(profileId)}, ${sqlValue(text)})`);
  },
  async saveProfile(profile: any, userId: string, profileId?: string) {
    if (profileId) {
      await getDb().query(`UPDATE builder_profiles SET name=${sqlValue(profile.name || '')}, username=${sqlValue(profile.username || '')}, email=${sqlValue(profile.email || '')}, country=${sqlValue(profile.country || '')}, timezone=${sqlValue(profile.timezone || '')}, skills=${sqlValue(profile.skills || '')}, preferred_stack=${sqlValue(profile.preferred_stack || '')}, portfolio_url=${sqlValue(profile.portfolio_url || '')}, github_url=${sqlValue(profile.github_url || '')}, twitter_url=${sqlValue(profile.twitter_url || '')}, availability=${sqlValue(profile.availability || '')}, looking_for_paid_work=${sqlValue(!!profile.looking_for_paid_work)}, bio=${sqlValue(profile.bio || '')}, updated_at=now() WHERE id=${sqlValue(profileId)}`);
      return profileId;
    }
    const rows = await getDb().query(`INSERT INTO builder_profiles (user_id, name, username, email, country, timezone, skills, preferred_stack, portfolio_url, github_url, twitter_url, availability, looking_for_paid_work, bio, status) VALUES (${sqlValue(userId)}, ${sqlValue(profile.name || '')}, ${sqlValue(profile.username || '')}, ${sqlValue(profile.email || '')}, ${sqlValue(profile.country || '')}, ${sqlValue(profile.timezone || '')}, ${sqlValue(profile.skills || '')}, ${sqlValue(profile.preferred_stack || '')}, ${sqlValue(profile.portfolio_url || '')}, ${sqlValue(profile.github_url || '')}, ${sqlValue(profile.twitter_url || '')}, ${sqlValue(profile.availability || '')}, ${sqlValue(!!profile.looking_for_paid_work)}, ${sqlValue(profile.bio || '')}, 'Active Builder') RETURNING id`);
    return rows[0].id;
  },
  async verifyProfile(profileId: string, actorId: string) {
    await getDb().query(`UPDATE builder_profiles SET status = 'Verified Builder', updated_at = now() WHERE id = ${sqlValue(profileId)}`);
    await writeAuditLog(actorId, 'verify_builder_profile', 'builder_profile', profileId);
  },
  async awardStar(profileId: string, requestId: string, actorId: string) {
    await getDb().query('BEGIN');
    try {
      await getDb().query(`INSERT INTO stars (profile_id, build_request_id, awarded_by) VALUES (${sqlValue(profileId)}, ${sqlValue(requestId)}, ${sqlValue(actorId)})`);
      await getDb().query(`UPDATE builder_profiles SET stars_count = stars_count + 1, updated_at = now() WHERE id = ${sqlValue(profileId)}`);
      await writeAuditLog(actorId, 'award_star', 'builder_profile', profileId, { buildRequestId: requestId });
      await getDb().query('COMMIT');
    } catch (error) { await getDb().query('ROLLBACK'); throw error; }
  },
  async postDailySignal(message: string, userId: string) {
    await getDb().query(`INSERT INTO daily_signals (message, created_by) VALUES (${sqlValue(message)}, ${sqlValue(userId)})`);
  }
};
