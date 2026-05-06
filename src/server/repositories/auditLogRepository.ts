import { getDb, sqlValue } from '../db/postgres';

export async function writeAuditLog(actorId: string | null, action: string, targetType?: string, targetId?: string, details: Record<string, unknown> = {}) {
  await getDb().query(`INSERT INTO audit_logs (actor_id, action, target_type, target_id, details) VALUES (${sqlValue(actorId)}, ${sqlValue(action)}, ${sqlValue(targetType)}, ${sqlValue(targetId)}, ${sqlValue(details)})`);
}
