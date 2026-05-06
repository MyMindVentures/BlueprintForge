# Firebase to Railway PostgreSQL Migration

## Summary

BlueprintForge AI now uses Railway PostgreSQL as the primary application data source. Firebase remains temporarily for Google/Firebase Auth only; Firestore is no longer used by the production persistence path.

Railway supplies `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE`. The app uses `DATABASE_URL` server-side only.

## Firebase usage audit

Searched for `firebase`, `firestore`, `realtime database`, `getDocs`, `addDoc`, `setDoc`, `updateDoc`, `deleteDoc`, `collection`, `doc`, `onSnapshot`, `firebaseConfig`, `VITE_FIREBASE`, and `FIREBASE_`.

### Files that used Firebase before migration

- `src/services/firebase.ts` initialized Firebase Auth and Firestore from `firebase-applet-config.json`.
- `src/hooks/useAuth.tsx` used Firebase Auth and Firestore `profiles` for app roles/version acknowledgements.
- `src/services/buildFeedService.ts` used Firestore for `build_requests`, `daily_signals`, `vibe_coder_profiles`, and `builder_star_events`.
- `src/hooks/useBuildFeed.ts` used Firestore for request updates, profile writes, daily signals, focus toggles, and status updates.
- `src/hooks/useNotifications.ts` used Firestore `notifications` with realtime listeners.
- `src/hooks/useGuide.ts` used Firestore `app_versions`, `user_flows`, `demo_sessions`, `demo_recordings`, and notification fan-out.
- `src/hooks/useVision.ts` used Firestore `founder_visions`.
- `src/hooks/useWorkspace.ts`, `src/hooks/useProjects.ts`, `src/hooks/useAgents.ts`, `src/hooks/usePipeline.ts`, `src/hooks/useImagePipeline.ts`, `src/hooks/useLLMSettings.ts`, and `src/hooks/useGithubSettings.ts` used Firestore for workspace projects, agents, settings, model sync state, and GitHub settings.
- Documentation/config references remain in `BlueprintForge.md`, `architecture_spec.md`, `docs/FunctionDocumentationAudit.md`, `docs/ManualTestChecklist.md`, `firebase-blueprint.json`, and `firestore.rules` as historical/deprecated Firebase artifacts.

### Data models found in Firestore

- `profiles`: app user profile, role, version acknowledgements.
- `vibe_coder_profiles`: builder profile, skills, availability, reputation stats.
- `build_requests`: founder tickets, claim state, GitHub/PR metadata, current focus.
- `build_request_updates`: progress updates and claim activity.
- `builder_star_events`: reputation star awards.
- `daily_signals`: founder messages.
- `notifications`: per-user unread/read notifications.
- `app_versions`: changelog/version popup source.
- `user_flows`, `demo_sessions`, `demo_recordings`: guide and demo recorder state.
- `founder_visions`: founder vision board.
- `projects`, `agents`, `settings`, `github_settings`: workspace and configuration state.

### Realtime listeners

Firestore `onSnapshot` was used for live request/profile/signal feeds, notifications, guide data, founder visions, projects, agents, settings, and GitHub settings. These are now normal API fetches with short polling/refresh. Future realtime upgrades can use WebSockets, Server-Sent Events, or PostgreSQL `LISTEN/NOTIFY` plus a server push layer.

### Auth dependencies

Firebase Auth remains temporarily for Google sign-in/sign-out and browser session detection. After Firebase Auth emits a user, the server creates/loads the BlueprintForge application user in PostgreSQL. Version acknowledgements and roles now persist in PostgreSQL.

### Upload/storage dependencies

No Firebase Storage imports were found in application source. Existing image/demo recording fields store URLs/metadata only. If binary uploads are added later, use Railway-compatible object storage or another server-side storage service rather than Firebase Storage by default.

### Migration risks

- Existing Firestore production data needs a one-time export/import into the PostgreSQL tables before cutover.
- Realtime parity is intentionally deferred; users may see updates after the polling interval rather than instantly.
- Firebase Auth is not yet verified server-side with Firebase Admin. The API keeps role checks, but a production hardening pass should validate ID tokens on the server.
- GitHub/OpenRouter user-entered settings are now stored in PostgreSQL; secrets should be moved to server-managed env vars where possible.
- Demo reset must continue filtering on `is_demo`/`demo_data_set_id`; never run broad deletes against production rows.

## PostgreSQL persistence layer

The migration uses a lightweight direct SQL layer because no ORM existed in the project and `pg` could not be installed in this environment. A minimal server-side PostgreSQL client lives at `src/server/db/postgres.ts` and connects via `DATABASE_URL`. Browser code never sees database credentials.

Repository modules:

- `userRepository`
- `buildRequestRepository`
- `notificationRepository`
- `versionRepository`
- `auditLogRepository`
- `genericRepository` for workspace support tables

## Tables created

Migration `migrations/001_initial_postgres.sql` creates:

- `users`
- `builder_profiles`
- `build_requests`
- `build_request_claims`
- `progress_updates`
- `github_issues`
- `pull_requests`
- `stars`
- `founder_visions`
- `app_concepts`
- `daily_signals`
- `current_focus_items`
- `notifications`
- `app_versions`
- `version_acknowledgements`
- `guide_sections`
- `audit_logs`
- `demo_data_sets`
- plus support tables for demo sessions/recordings, user flows, projects, agents, settings, and GitHub settings.

All core tables include `created_at` and `updated_at`; role/access/demo isolation fields are included where needed.

## Railway setup

1. Add a Railway PostgreSQL service.
2. Copy Railway's `DATABASE_URL` into the BlueprintForge AI web service variables.
3. Keep `DATABASE_URL`, `OPENROUTER_API_KEY`, and `GITHUB_TOKEN` server-side only.
4. Run migrations before the first production deploy or as a Railway pre-deploy command:

```bash
npm run db:migrate
```

5. Optional demo seed:

```bash
npm run db:seed
```

## Demo data policy

Demo rows are marked with `is_demo` and/or `demo_data_set_id`. Demo seed/reset/regenerate logic must only target those rows. Demo users must not mutate production rows.

## Audit log coverage

PostgreSQL audit logs are written for publish build request, create GitHub issue metadata, award star, publish changelog, demo session seed/reset operations, and builder verification. Accept/reject PR and remove-star actions should call `writeAuditLog` when those UI actions are expanded.
