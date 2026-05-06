# Railway Deployment Runbook

BlueprintForge AI deploys to Railway as a standard production Node/Express web app. Railway is the temporary production host, OpenRouter is the AI provider, and the app does not require any provider-specific development studio runtime.

## Required environment variables

Set these in the Railway service environment variable panel:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | Server-side OpenRouter key used by AI ticket polishing, model sync, diagnostics, and model intelligence calls. |
| `NODE_ENV` | Yes | Set to `production` so the Express server serves the built frontend from `dist`. |
| `GITHUB_TOKEN` | If GitHub automation is enabled | Token for creating issues, syncing PR metadata, or other GitHub automation. Do not expose it to browser code. |
| `DATABASE_URL` | Yes | Railway PostgreSQL connection string used by the server-side persistence layer. |
| `APP_URL` | Recommended | Canonical public URL for OpenRouter referer metadata, OAuth callbacks, and generated links. |

Do not add `VITE_` to secret variables. Vite only exposes variables prefixed with `VITE_`, so reserve that prefix for intentionally public values.

## PostgreSQL migrations

BlueprintForge AI stores production app data in Railway PostgreSQL. Add a Railway PostgreSQL plugin/service and ensure the web service receives `DATABASE_URL`. Before the first deploy, and before deploys containing new migration files, run:

```bash
npm run db:migrate
```

You can run this manually from a Railway shell/job or configure it as a pre-deploy step before `npm run start`. Optional demo starter data can be inserted with:

```bash
npm run db:seed
```

Demo seed/reset logic must only affect rows marked `is_demo` or a specific `demo_data_set_id`.

## Build command

```bash
npm run build
```

This command creates the Vite frontend bundle and bundles `server.ts` into `dist/server.js`.

## Start command

```bash
npm run start
```

The start command runs the production server with `node dist/server.js`. It must not run the development server.

## Railway PORT rule

Railway provides a `PORT` environment variable automatically for public services. BlueprintForge AI listens on:

```ts
process.env.PORT || 3000
```

and binds to:

```ts
0.0.0.0
```

Do not hardcode a different production port or bind only to `localhost`; Railway public traffic requires `0.0.0.0:$PORT`.

## Deploy from GitHub

1. Push the desired changes to the GitHub repository.
2. In Railway, create or open the BlueprintForge AI project.
3. Connect the GitHub repository.
4. Select the `main` branch for production deployments.
5. Confirm the build command is `npm run build`.
6. Confirm the start command is `npm run start`.
7. Add the required environment variables.
8. Deploy the service and wait for the build and deploy phases to finish.

The included `railway.json` config sets the Nixpacks builder and production start command.

## Check logs

Use the Railway dashboard logs for the service:

1. Open the Railway project.
2. Select the BlueprintForge AI service.
3. Open **Deployments** to inspect build logs.
4. Open **Logs** to inspect runtime logs.
5. Verify the server logs a message similar to `Server running on http://0.0.0.0:<PORT>`.

## Test health

After deployment, open:

```text
https://<your-railway-domain>/health
```

A healthy service returns JSON similar to:

```json
{
  "status": "ok",
  "app": "BlueprintForge AI",
  "timestamp": "2026-05-06T00:00:00.000Z"
}
```

## Rollback notes

If a deployment fails or introduces a production issue:

1. Open the Railway service.
2. Go to **Deployments**.
3. Select the last known good deployment.
4. Use Railway's redeploy or rollback controls.
5. Re-check `/health` and the main app URL after rollback.

Keep database migrations and destructive persistence changes separate from routine frontend/server deploys until a migration workflow exists.

## Known temporary limitations

- GitHub automation requires `GITHUB_TOKEN` only when the related issue/PR automation is active.
- Firebase is retained temporarily for authentication only; Firestore is not the primary production data store.
- Realtime Firestore listeners were replaced with API fetch plus polling. Future upgrades can use WebSockets, Server-Sent Events, or PostgreSQL notifications.
- Some OpenRouter settings can be entered through the UI for diagnostics and user-managed workflows. The production `OPENROUTER_API_KEY` must remain server-side and must not be bundled into frontend code.
- The smoke test suite is a development aid and may need updates as the public landing and navigation UX evolves.
