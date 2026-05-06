import { PostgresClient, sqlValue } from '../src/server/db/postgres';

async function main() {
  const db = new PostgresClient();
  await db.query(`INSERT INTO users (id, name, role, is_demo) VALUES ('admin-1', 'Founder', 'admin', TRUE) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, updated_at = now()`);
  await db.query(`INSERT INTO users (id, name, role, is_demo) VALUES ('coder-1', 'Vibe Coder Alex', 'vibe_coder', TRUE) ON CONFLICT (id) DO NOTHING`);
  await db.query(`INSERT INTO users (id, name, role, is_demo) VALUES ('coder-2', 'Vibe Coder Sam', 'vibe_coder', TRUE) ON CONFLICT (id) DO NOTHING`);
  await db.query(`INSERT INTO daily_signals (message, created_by, is_demo) VALUES (${sqlValue('Demo data is isolated in PostgreSQL and marked with is_demo=true.')}, 'admin-1', TRUE)`);
  await db.close();
  console.log('Seeded PostgreSQL demo data.');
}
main().catch((error) => { console.error(error); process.exit(1); });
