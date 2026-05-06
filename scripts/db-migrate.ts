import fs from 'node:fs';
import path from 'node:path';
import { PostgresClient } from '../src/server/db/postgres';

async function main() {
  const db = new PostgresClient();
  const dir = path.resolve('migrations');
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.sql')).sort();
  await db.query('CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
  const applied = new Set((await db.query<{ version: string }>('SELECT version FROM schema_migrations')).map((row) => row.version));
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await db.query('BEGIN');
    try {
      await db.query(sql);
      await db.query(`INSERT INTO schema_migrations (version) VALUES ('${file.replace(/'/g, "''")}')`);
      await db.query('COMMIT');
      console.log(`Applied ${file}`);
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }
  await db.close();
}

main().catch((error) => { console.error(error); process.exit(1); });
