# Admin Access Debug — ROLE-01 Founder/Admin

## Root cause found

Admin access was failing because the auth/role path used multiple role names and did not update existing PostgreSQL users when the founder identity was detected:

1. Firebase Auth signed the user in successfully, but PostgreSQL role hydration returned the stored `users.role` value.
2. The seed and older code used `admin`, while the product role definition expects `ROLE-01` for The Architect / Founder.
3. `upsertFirebaseUser` only assigned the hardcoded founder email on first insert. Existing founder rows that already had `vibe_coder` stayed `vibe_coder` after login because the conflict update did not update `role`.
4. Frontend route visibility checked only `admin`, and server protected APIs checked only the raw `admin` header.
5. Unauthorized admin views could be hidden or blocked without explaining the resolved role or missing permission.

## Auth provider used

BlueprintForge AI currently uses Firebase Auth for sign-in and PostgreSQL for app/user persistence.

- Browser auth provider: Firebase Auth Google popup.
- Session persistence: Firebase `browserLocalPersistence`.
- App profile persistence: PostgreSQL `users` table.
- Current API auth transport: client sends hydrated `X-User-Id` and `X-User-Role` headers from the PostgreSQL profile.
- JWT status: Firebase ID tokens are not yet verified server-side because `firebase-admin` is not installed/configured in this repo.

## Role system used

The canonical founder/admin role is:

```text
ROLE-01
```

Legacy aliases still resolve to `ROLE-01` to keep existing data working:

- `admin`
- `founder`
- `architect`
- `administrator`

Builder users remain `vibe_coder`; anonymous/public users remain `anonymous`.

## Fixes applied

- Added shared role normalization for canonical `ROLE-01` checks.
- Updated Firebase profile upsert so founder/admin identities are promoted to `ROLE-01` even when the PostgreSQL user row already exists.
- Added Railway/server env support for comma-separated `FOUNDER_ADMIN_EMAILS` and `FOUNDER_ADMIN_UIDS`.
- Kept the current founder email as a legacy default so production is not blocked if the new env var is missing during the next deploy.
- Updated frontend navigation and route protection to use canonical founder/admin detection.
- Added a clear admin-access-denied screen that shows:
  - requested screen,
  - resolved role,
  - missing permission (`ROLE-01`),
  - auth/profile error if present.
- Protected OpenRouter settings persistence on the server with founder/admin checks.
- Added gated debug logging for auth state, role resolution and route protection checks.
- Added a migration to canonicalize legacy founder/admin roles to `ROLE-01` and create a safe bootstrap admin row.

## Admin seed/setup steps

### Railway production

1. Confirm Firebase Google sign-in is configured for the production domain.
2. Set at least one of these server-side Railway variables:

```text
FOUNDER_ADMIN_EMAILS=founder@example.com,second-founder@example.com
FOUNDER_ADMIN_UIDS=firebaseUid1,firebaseUid2
```

3. Keep these existing server-side variables configured:

```text
DATABASE_URL=postgresql://...
OPENROUTER_API_KEY=...
GITHUB_TOKEN=...
APP_URL=https://your-production-url
```

4. Run migrations before or during deploy:

```bash
npm run db:migrate
```

5. Sign out and sign back in. The `/api/auth/firebase-profile` hydration call will upsert the Firebase user and persist `users.role = 'ROLE-01'` for matching founder identities.

### Local/manual bootstrap

For a fresh database, run:

```bash
npm run db:migrate
npm run db:seed
```

The seed creates a safe bootstrap/demo founder row with `ROLE-01`. Real Firebase users still need their email or UID listed in `FOUNDER_ADMIN_EMAILS` or `FOUNDER_ADMIN_UIDS` to hydrate as founder/admin on sign-in.

## Safe debug logging

Debug logging is gated and does not print secrets. It masks email addresses in browser logs.

Enable it temporarily in one browser session:

```js
localStorage.setItem('blueprintforge.authDebug', 'true')
```

Disable it:

```js
localStorage.removeItem('blueprintforge.authDebug')
```

You can also set `VITE_AUTH_DEBUG=true`, but localStorage is safer for temporary production debugging because it avoids enabling logs for every user.

## Protected ROLE-01 areas verified by code path

These screens now require a resolved founder/admin role:

- Founder Command Center (`feed_admin`)
- OpenRouter Settings (`llm`)
- OpenRouter Diagnostics (`diagnostics`)
- GitHub Repo Settings (`github-settings` API, surfaced inside OpenRouter Settings)
- Demo Recorder/Seeder sessions (`guide/demo-sessions` APIs and Auto Demo Recorder controls)
- Version Management (`guide/versions` API)
- Admin Persistence Layer projects (`projects`)
- Admin Persistence Layer agents (`agents`)

The navigation exposes these areas only for users whose normalized role is `ROLE-01`. Direct route/view access also renders the explicit denial screen instead of a blank screen or redirect loop.

## Railway env vars required

| Variable | Required | Scope | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Server only | PostgreSQL persistence and role hydration. |
| `FOUNDER_ADMIN_EMAILS` | Recommended | Server only | Comma-separated Firebase emails that resolve to `ROLE-01`. |
| `FOUNDER_ADMIN_UIDS` | Recommended fallback | Server only | Comma-separated Firebase UIDs that resolve to `ROLE-01`. |
| `OPENROUTER_API_KEY` | For AI features | Server only | Server-side OpenRouter integration. |
| `GITHUB_TOKEN` | For GitHub features | Server only | Server-side GitHub integration. |
| `APP_URL` | Recommended | Server only | Public app URL for server-side integration headers. |
| `VITE_AUTH_DEBUG` | Optional temporary | Public/browser | Enables safe auth debug logs globally if set to `true`. |

## Remaining auth risks

1. Server APIs still trust client-provided `X-User-Id` and `X-User-Role` headers. This should be replaced with Firebase ID token verification using `firebase-admin` or a dedicated session/JWT layer.
2. OpenRouter/GitHub tokens must remain server-side. Existing frontend settings UI should continue avoiding secret exposure.
3. The bootstrap `admin-1` row is useful for demo/manual data, but real production access must be tied to Firebase identities through `FOUNDER_ADMIN_EMAILS` or `FOUNDER_ADMIN_UIDS`.
4. If Railway migrations are not run, legacy `admin` rows may still work through aliases, but canonical persistence to `ROLE-01` may be delayed until the founder signs in again.
