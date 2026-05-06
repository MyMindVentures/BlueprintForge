import type express from 'express';
import { buildRequestRepository } from './repositories/buildRequestRepository';
import { userRepository } from './repositories/userRepository';
import { notificationRepository } from './repositories/notificationRepository';
import { versionRepository } from './repositories/versionRepository';
import { genericRepository } from './repositories/genericRepository';
import { getDb, sqlValue } from './db/postgres';
import { FOUNDER_ROLE, isFounderAdminRole, normalizeRole } from '../authRoles';

const actor = (req: express.Request) => String(req.headers['x-user-id'] || req.body?.userId || 'anonymous');
const role = (req: express.Request) => normalizeRole(String(req.headers['x-user-role'] || req.body?.role || 'anonymous'));
const requireAdmin = (req: express.Request) => {
  if (!isFounderAdminRole(role(req))) {
    const error = new Error(`Admin access required. Resolved role: ${role(req)}. Missing permission: ${FOUNDER_ROLE}.`);
    error.name = 'AdminAccessError';
    throw error;
  }
};

export function registerApiRoutes(app: express.Express) {
  const wrap = (handler: express.RequestHandler): express.RequestHandler => async (req, res) => {
    try { await handler(req, res, () => undefined); } catch (error: any) { res.status(error.name === 'AdminAccessError' || error.message?.includes('Admin') ? 403 : 500).json({ error: error.message || 'Request failed', resolvedRole: error.name === 'AdminAccessError' ? role(req) : undefined, missingPermission: error.name === 'AdminAccessError' ? FOUNDER_ROLE : undefined }); }
  };

  app.post('/api/auth/firebase-profile', wrap(async (req, res) => res.json(await userRepository.upsertFirebaseUser(req.body))));
  app.post('/api/auth/acknowledge-version', wrap(async (req, res) => res.json(await userRepository.acknowledgeVersion(actor(req), req.body.version))));
  app.post('/api/auth/preferred-language', wrap(async (req, res) => res.json(await userRepository.updatePreferredLanguage(actor(req), req.body.preferred_language || 'en'))));

  app.get('/api/build-feed', wrap(async (_req, res) => res.json(await buildRequestRepository.listAll())));
  app.post('/api/build-requests', wrap(async (req, res) => { requireAdmin(req); res.json({ id: await buildRequestRepository.publish(req.body.request, actor(req)) }); }));
  app.patch('/api/build-requests/:id', wrap(async (req, res) => { await buildRequestRepository.update(req.params.id, req.body.updates, actor(req)); res.json({ ok: true }); }));
  app.post('/api/build-requests/:id/claim', wrap(async (req, res) => { await buildRequestRepository.claim(req.params.id, actor(req), req.body.profileId); res.json({ ok: true }); }));
  app.post('/api/build-requests/:id/updates', wrap(async (req, res) => { await buildRequestRepository.postUpdate(req.params.id, actor(req), req.body.profileId || null, req.body.updateText); res.json({ ok: true }); }));
  app.post('/api/builder-profiles', wrap(async (req, res) => res.json({ id: await buildRequestRepository.saveProfile(req.body.profile, actor(req), req.body.profileId) })));
  app.patch('/api/builder-profiles/:id/verify', wrap(async (req, res) => { requireAdmin(req); await buildRequestRepository.verifyProfile(req.params.id, actor(req)); res.json({ ok: true }); }));
  app.post('/api/builder-profiles/:id/stars', wrap(async (req, res) => { requireAdmin(req); await buildRequestRepository.awardStar(req.params.id, req.body.buildRequestId, actor(req)); res.json({ ok: true }); }));
  app.post('/api/daily-signals', wrap(async (req, res) => { requireAdmin(req); await buildRequestRepository.postDailySignal(req.body.message, actor(req)); res.json({ ok: true }); }));

  app.get('/api/notifications', wrap(async (req, res) => res.json(await notificationRepository.list(actor(req)))));
  app.patch('/api/notifications/:id/read', wrap(async (req, res) => { await notificationRepository.markRead(req.params.id, actor(req)); res.json({ ok: true }); }));
  app.post('/api/notifications', wrap(async (req, res) => { await notificationRepository.create(req.body.notification); res.json({ ok: true }); }));

  app.get('/api/guide', wrap(async (_req, res) => res.json(await versionRepository.listGuide())));
  app.post('/api/guide/versions', wrap(async (req, res) => { requireAdmin(req); res.json({ id: await versionRepository.publish(req.body.version, actor(req)) }); }));
  app.post('/api/guide/demo-sessions', wrap(async (req, res) => { requireAdmin(req); res.json(await versionRepository.startDemoSession(req.body.session, actor(req))); }));
  app.post('/api/guide/demo-sessions/:id/complete', wrap(async (req, res) => { requireAdmin(req); await versionRepository.completeDemoSession(req.params.id, req.body.recording, actor(req)); res.json({ ok: true }); }));

  app.get('/api/visions', wrap(async (_req, res) => res.json((await getDb().query('SELECT id::text, title, vision_statement, context, goal, status, created_by, created_at FROM founder_visions ORDER BY created_at DESC')))));
  app.post('/api/visions', wrap(async (req, res) => { requireAdmin(req); const v = req.body.vision; const rows = await getDb().query(`INSERT INTO founder_visions (title, vision_statement, context, goal, status, created_by) VALUES (${sqlValue(v.title)}, ${sqlValue(v.vision_statement)}, ${sqlValue(v.context || '')}, ${sqlValue(v.goal || '')}, ${sqlValue(v.status || 'Thinking')}, ${sqlValue(actor(req))}) RETURNING id::text`); res.json({ id: rows[0].id }); }));

  app.get('/api/workspace/:table', wrap(async (req, res) => res.json(await genericRepository.list(req.params.table, actor(req)))));
  app.post('/api/workspace/:table', wrap(async (req, res) => res.json({ id: await genericRepository.create(req.params.table, actor(req), req.body.data) })));
  app.patch('/api/workspace/:table/:id', wrap(async (req, res) => { await genericRepository.update(req.params.table, req.params.id, actor(req), req.body.data); res.json({ ok: true }); }));
  app.delete('/api/workspace/:table/:id', wrap(async (req, res) => { await genericRepository.delete(req.params.table, req.params.id, actor(req)); res.json({ ok: true }); }));
  app.get('/api/settings', wrap(async (req, res) => { requireAdmin(req); res.json(await genericRepository.getSettings(actor(req)) || {}); }));
  app.patch('/api/settings', wrap(async (req, res) => { requireAdmin(req); await genericRepository.updateSettings(actor(req), req.body.data); res.json({ ok: true }); }));
  app.get('/api/github-settings', wrap(async (req, res) => { requireAdmin(req); res.json(await genericRepository.getGithubSettings() || {}); }));
  app.patch('/api/github-settings', wrap(async (req, res) => { requireAdmin(req); await genericRepository.updateGithubSettings(req.body.data); res.json({ ok: true }); }));
}
