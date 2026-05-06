import { getDb, sqlValue } from '../db/postgres';
import { FOUNDER_ROLE, BUILDER_ROLE, normalizeRole } from '../../authRoles';

const parseList = (value?: string) => (value || '').split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean);
const founderEmails = () => parseList(process.env.FOUNDER_ADMIN_EMAILS || process.env.ADMIN_EMAILS || 'lacometta33@gmail.com');
const founderUids = () => parseList(process.env.FOUNDER_ADMIN_UIDS || process.env.ADMIN_UIDS);

const rowToUser = (row: any) => ({
  id: row.id,
  name: row.name,
  role: normalizeRole(row.role),
  acknowledged_versions: row.acknowledged_versions ? JSON.parse(row.acknowledged_versions) : [],
  role_resolution: row.role_resolution ? JSON.parse(row.role_resolution) : undefined
});

const isFounderAdminIdentity = (input: { uid: string; email?: string | null }) => {
  const email = input.email?.trim().toLowerCase() || '';
  const uid = input.uid.trim().toLowerCase();
  return founderEmails().includes(email) || founderUids().includes(uid);
};

export const userRepository = {
  resolveRoleForFirebaseUser(input: { uid: string; email?: string | null }) {
    return isFounderAdminIdentity(input) ? FOUNDER_ROLE : BUILDER_ROLE;
  },

  async upsertFirebaseUser(input: { uid: string; email?: string | null; name?: string | null }) {
    const resolvedRole = this.resolveRoleForFirebaseUser(input);
    const rows = await getDb().query(`
      INSERT INTO users (id, firebase_uid, email, name, role, auth_provider)
      VALUES (${sqlValue(input.uid)}, ${sqlValue(input.uid)}, ${sqlValue(input.email)}, ${sqlValue(input.name || 'Architect')}, ${sqlValue(resolvedRole)}, 'firebase')
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(NULLIF(EXCLUDED.name, ''), users.name),
        role = CASE
          WHEN EXCLUDED.role = ${sqlValue(FOUNDER_ROLE)} THEN ${sqlValue(FOUNDER_ROLE)}
          WHEN users.role IN ('admin', ${sqlValue(FOUNDER_ROLE)}, 'founder', 'architect') THEN ${sqlValue(FOUNDER_ROLE)}
          ELSE COALESCE(NULLIF(users.role, ''), EXCLUDED.role)
        END,
        firebase_uid = COALESCE(users.firebase_uid, EXCLUDED.firebase_uid),
        auth_provider = COALESCE(users.auth_provider, EXCLUDED.auth_provider),
        updated_at = now()
      RETURNING id, name, role,
        json_build_object(
          'provider', auth_provider,
          'matchedFounderEmail', ${isFounderAdminIdentity(input) && Boolean(input.email)},
          'matchedFounderUid', ${founderUids().includes(input.uid.trim().toLowerCase())},
          'storedRole', role,
          'canonicalRole', CASE WHEN role IN ('admin', ${sqlValue(FOUNDER_ROLE)}, 'founder', 'architect') THEN ${sqlValue(FOUNDER_ROLE)} ELSE role END
        ) AS role_resolution,
        COALESCE((SELECT json_agg(version) FROM version_acknowledgements WHERE user_id = users.id), '[]'::json) AS acknowledged_versions`);
    return rowToUser(rows[0]);
  },
  async acknowledgeVersion(userId: string, version: string) {
    await getDb().query(`INSERT INTO version_acknowledgements (user_id, version) VALUES (${sqlValue(userId)}, ${sqlValue(version)}) ON CONFLICT (user_id, version) DO NOTHING`);
    const rows = await getDb().query(`SELECT id, name, role, COALESCE((SELECT json_agg(version) FROM version_acknowledgements WHERE user_id = users.id), '[]'::json) AS acknowledged_versions FROM users WHERE id = ${sqlValue(userId)}`);
    return rows[0] ? rowToUser(rows[0]) : null;
  }
};
