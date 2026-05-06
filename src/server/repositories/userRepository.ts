import { getDb, sqlValue } from '../db/postgres';

const rowToUser = (row: any) => ({ id: row.id, name: row.name, role: row.role, acknowledged_versions: row.acknowledged_versions ? JSON.parse(row.acknowledged_versions) : [] });

export const userRepository = {
  async upsertFirebaseUser(input: { uid: string; email?: string | null; name?: string | null }) {
    const role = input.email === 'lacometta33@gmail.com' ? 'admin' : 'vibe_coder';
    const rows = await getDb().query(`
      INSERT INTO users (id, firebase_uid, email, name, role, auth_provider)
      VALUES (${sqlValue(input.uid)}, ${sqlValue(input.uid)}, ${sqlValue(input.email)}, ${sqlValue(input.name || 'Architect')}, ${sqlValue(role)}, 'firebase')
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = COALESCE(NULLIF(EXCLUDED.name, ''), users.name), updated_at = now()
      RETURNING id, name, role, COALESCE((SELECT json_agg(version) FROM version_acknowledgements WHERE user_id = users.id), '[]'::json) AS acknowledged_versions`);
    return rowToUser(rows[0]);
  },
  async acknowledgeVersion(userId: string, version: string) {
    await getDb().query(`INSERT INTO version_acknowledgements (user_id, version) VALUES (${sqlValue(userId)}, ${sqlValue(version)}) ON CONFLICT (user_id, version) DO NOTHING`);
    const rows = await getDb().query(`SELECT id, name, role, COALESCE((SELECT json_agg(version) FROM version_acknowledgements WHERE user_id = users.id), '[]'::json) AS acknowledged_versions FROM users WHERE id = ${sqlValue(userId)}`);
    return rows[0] ? rowToUser(rows[0]) : null;
  }
};
