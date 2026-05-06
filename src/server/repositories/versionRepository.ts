import { getDb, sqlValue } from '../db/postgres';
import { writeAuditLog } from './auditLogRepository';
const parse = (r: any) => ({ ...r, new_features: JSON.parse(r.new_features), fixed_issues: JSON.parse(r.fixed_issues), known_limitations: JSON.parse(r.known_limitations) });
export const versionRepository = {
  async listGuide() {
    const versions = await getDb().query('SELECT id::text, version, release_title, release_notes, new_features::text, fixed_issues::text, known_limitations::text, github_release_url, published_by, created_at FROM app_versions ORDER BY created_at DESC');
    const flows = await getDb().query('SELECT id::text, title, description, steps::text, related_pages::text FROM user_flows ORDER BY updated_at DESC');
    const recordings = await getDb().query('SELECT id::text, version, filename, file_url, duration, created_by, created_at FROM demo_recordings ORDER BY created_at DESC');
    return { versions: versions.map(parse), flows: flows.map((f) => ({...f, steps: JSON.parse(f.steps), related_pages: JSON.parse(f.related_pages)})), recordings };
  },
  async publish(version: any, userId: string) {
    const rows = await getDb().query(`INSERT INTO app_versions (version, release_title, release_notes, new_features, fixed_issues, known_limitations, github_release_url, published_by, created_by) VALUES (${sqlValue(version.version)}, ${sqlValue(version.release_title)}, ${sqlValue(version.release_notes || '')}, ${sqlValue(version.new_features || [])}, ${sqlValue(version.fixed_issues || [])}, ${sqlValue(version.known_limitations || [])}, ${sqlValue(version.github_release_url)}, ${sqlValue(userId)}, ${sqlValue(userId)}) RETURNING id`);
    const builders = await getDb().query('SELECT user_id FROM builder_profiles');
    for (const b of builders) await getDb().query(`INSERT INTO notifications (user_id,type,title,message,link,is_read) VALUES (${sqlValue(b.user_id)}, 'version_deployed', ${sqlValue(`New version ${version.version} deployed`)}, ${sqlValue(version.release_notes || 'Check out the new features in our latest update.')}, 'SCR-24', FALSE)`);
    await writeAuditLog(userId, 'publish_changelog', 'app_version', rows[0].id, { version: version.version });
    return rows[0].id;
  },
  async startDemoSession(input: any, userId: string) {
    const rows = await getDb().query(`INSERT INTO demo_sessions (version,status,selected_flows,is_recording,created_by) VALUES (${sqlValue(input.version)}, ${sqlValue(input.status)}, ${sqlValue(input.selected_flows || [])}, ${sqlValue(!!input.is_recording)}, ${sqlValue(userId)}) RETURNING id::text, version, status, selected_flows::text, is_recording, created_by, created_at`);
    await writeAuditLog(userId, 'seed_reset_demo_data', 'demo_session', rows[0].id, { action: 'start' });
    return { ...rows[0], selected_flows: JSON.parse(rows[0].selected_flows) };
  },
  async completeDemoSession(id: string, recording: any, userId: string) {
    if (recording) await getDb().query(`INSERT INTO demo_recordings (demo_session_id, version, filename, file_url, duration, created_by) VALUES (${sqlValue(id)}, ${sqlValue(recording.version)}, ${sqlValue(recording.filename)}, ${sqlValue(recording.file_url)}, ${sqlValue(recording.duration || 0)}, ${sqlValue(userId)})`);
    await getDb().query(`UPDATE demo_sessions SET status='completed', completed_at=now(), updated_at=now() WHERE id=${sqlValue(id)} AND created_by=${sqlValue(userId)}`);
  }
};
