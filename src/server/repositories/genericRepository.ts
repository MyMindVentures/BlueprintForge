import { getDb, sqlValue, sqlId } from '../db/postgres';
const tables = new Set(['projects', 'agents']);
export const genericRepository = {
  async list(table: string, userId: string) {
    if (!tables.has(table)) throw new Error('Unsupported table');
    const rows = await getDb().query(`SELECT id::text, data::text, created_at, updated_at FROM ${sqlId(table)} WHERE user_id=${sqlValue(userId)} ORDER BY updated_at DESC`);
    return rows.map((r) => ({ id: r.id, ...JSON.parse(r.data), createdAt: JSON.parse(r.data).createdAt || r.created_at, updatedAt: JSON.parse(r.data).updatedAt || r.updated_at }));
  },
  async create(table: string, userId: string, data: any) {
    if (!tables.has(table)) throw new Error('Unsupported table');
    const rows = await getDb().query(`INSERT INTO ${sqlId(table)} (user_id, data) VALUES (${sqlValue(userId)}, ${sqlValue(data)}) RETURNING id::text`);
    return rows[0].id;
  },
  async update(table: string, id: string, userId: string, data: any) {
    if (!tables.has(table)) throw new Error('Unsupported table');
    await getDb().query(`UPDATE ${sqlId(table)} SET data = data || ${sqlValue(data)}, updated_at=now() WHERE id=${sqlValue(id)} ${userId === 'anonymous' ? '' : `AND user_id=${sqlValue(userId)}`}`);
  },
  async delete(table: string, id: string, userId: string) {
    if (!tables.has(table)) throw new Error('Unsupported table');
    await getDb().query(`DELETE FROM ${sqlId(table)} WHERE id=${sqlValue(id)} ${userId === 'anonymous' ? '' : `AND user_id=${sqlValue(userId)}`}`);
  },
  async getSettings(userId: string) {
    const rows = await getDb().query(`SELECT data::text FROM user_settings WHERE user_id=${sqlValue(userId)}`);
    return rows[0] ? JSON.parse(rows[0].data) : null;
  },
  async updateSettings(userId: string, data: any) {
    await getDb().query(`INSERT INTO user_settings (user_id, data) VALUES (${sqlValue(userId)}, ${sqlValue(data)}) ON CONFLICT (user_id) DO UPDATE SET data = user_settings.data || EXCLUDED.data, updated_at=now()`);
  },
  async getGithubSettings() { const rows = await getDb().query("SELECT data::text FROM github_settings WHERE id='global'"); return rows[0] ? JSON.parse(rows[0].data) : null; },
  async updateGithubSettings(data: any) { await getDb().query(`INSERT INTO github_settings (id, data) VALUES ('global', ${sqlValue(data)}) ON CONFLICT (id) DO UPDATE SET data = github_settings.data || EXCLUDED.data, updated_at=now()`); }
};
