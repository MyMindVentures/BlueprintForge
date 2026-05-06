# ⚡ BlueprintForge AI

> Turn ideas into tickets.  
> Turn tickets into code.  
> Turn code into product.

BlueprintForge AI is an open-source execution platform where a visionary founder turns raw thoughts, goals, app concepts, product ideas, and improvement requests into structured build-ready tickets that builders can claim, implement, and ship through GitHub.

It is built around one relationship:

- 🧠 **The Architect** — the founder who brings vision, direction, concepts, and product energy
- 🛠️ **The Builders** — vibe coders who turn that vision into working software

---

## 🔁 Core Loop

```text
Founder thought
    ↓
AI-polished ticket
    ↓
Live build request
    ↓
GitHub issue
    ↓
Builder claims work
    ↓
Pull request
    ↓
Review and merge
    ↓
⭐ Stars / reputation
```

BlueprintForge AI is not only an app. It is a living proof-of-mind system where vision becomes tickets, tickets become GitHub issues, builders turn issues into pull requests, and accepted work improves the platform.

---

## 🚀 Why this exists

Most ideas never ship because the distance between vision and execution is too large.

BlueprintForge AI exists to make that distance smaller by helping a founder:

- capture raw thoughts and ideas
- convert them into structured development tickets
- publish live build requests
- attract vibe coders and contributors
- coordinate GitHub-based implementation
- track builder progress, reputation, and momentum
- build in public with clarity and proof

---

## 🧩 Main Features

- 🧠 Founder Command Center
- 📡 Live Build Feed
- 🧾 AI-polished build-ready tickets
- 🔗 GitHub issue and PR flow
- 🧑‍💻 Vibe Coder onboarding
- ⭐ Stars and reputation system
- 📣 Daily Signal and Founder Vision layer
- 🧭 Current Founder Focus
- 📚 Auto-updated BlueprintForge Guide
- 🌍 Multilingual interface
- 🔔 Notifications and version popups
- 🎥 Demo recorder and safe demo mode
- 💾 Persistent app data and audit logs

---

## 🧑‍💻 For Builders

BlueprintForge AI is designed for vibe coders who want to build real features with visible impact.

As a builder, you can:

- create a builder profile
- browse open build requests
- claim tickets
- follow linked GitHub issues
- submit progress updates
- submit PR URLs
- earn stars for accepted work
- grow public reputation inside the platform

No long hiring process. No vague tasks. Pick a request, build it, ship it.

---

## 🧠 For the Founder

The founder can:

- enter raw thoughts, improvements, and app ideas
- use AI to polish ideas into structured tickets
- publish build requests into the Live Build Feed
- mark up to 3 current focus items
- publish Daily Signals and Founder Vision posts
- create GitHub issues from build requests
- review PRs and implementation updates
- award stars to builders
- publish changelogs and app versions

---

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MyMindVentures/BlueprintForge.git
cd BlueprintForge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` for local development and fill in safe local values.

```env
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key-here
NODE_ENV=production
APP_URL=http://localhost:3000
GITHUB_TOKEN=ghp_your_github_token_placeholder
DATABASE_URL=postgresql://user:password@host:5432/blueprintforge
```

`OPENROUTER_API_KEY`, `GITHUB_TOKEN`, and `DATABASE_URL` are server-side values. Do not prefix them with `VITE_`, do not read them from browser code, and never commit real secrets. Vite should only expose intentionally public variables with the `VITE_` prefix.


### Database setup

BlueprintForge AI now uses Railway PostgreSQL for production persistence. Set `DATABASE_URL` server-side, then run:

```bash
npm run db:migrate
npm run db:seed # optional demo data
```

Available database commands:

- `npm run db:generate` — no-op for the direct SQL layer.
- `npm run db:migrate` — applies SQL migrations from `migrations/`.
- `npm run db:seed` — inserts isolated demo starter data.
- `npm run db:studio` — no-op with guidance; use Railway's Data tab or `psql`.

Firebase is no longer the primary persistence layer. Firebase remains temporarily for authentication only; app data, version acknowledgements, notifications, stars, build requests, guide records, and audit logs persist in PostgreSQL.

### 4. Run locally

```bash
npm run dev
```

### 5. Build and start production locally

```bash
npm run build
npm run start
```

The production server serves the Vite build from `dist`, supports client-side routing by falling back to `index.html`, and exposes `/health` for uptime checks.

---

## 📂 Important Project Files

```text
/Agent.md              Coding-agent rules and project conventions
/BlueprintForge.md     Full product blueprint: screens, roles, capabilities, functions
/docs                  Audits, guides, testing checklists, and implementation notes
/src                   Application source code
```

Every coding agent must read `/Agent.md` before making changes.

---

## 🧭 Product Blueprint

BlueprintForge AI is organized around:

- **SCR** — Screens
- **ROLE** — User roles
- **CAP** — Capabilities
- **FUNC** — Functions

The full source of truth lives in `/BlueprintForge.md`.

---

## 🔐 Roles

| Role | Description |
|---|---|
| Founder / Admin | The Architect. Creates visions, tickets, releases, demo flows, and manages builders. |
| Vibe Coder / Builder | Claims tickets, works through GitHub, submits PRs, and earns stars. |
| Visitor / Anonymous | Views public pages, previews, vision posts, and signup CTAs. |
| Investor / Observer | Follows founder vision, builder activity, and platform momentum. |
| Public Community Viewer | Reads public content, guides, app concepts, and contribution information. |
| Demo User | Uses sandbox demo flows with safe demo data only. |

---

## 🔗 GitHub Contribution Flow

1. Browse the Live Build Feed
2. Pick an open build request
3. Claim the request in the app
4. Open the linked GitHub issue
5. Fork the repository
6. Create a focused feature branch
7. Implement the request
8. Submit a pull request
9. Add the PR URL in BlueprintForge AI
10. Get reviewed
11. Earn stars when accepted

---

## 🧠 AI Layer

BlueprintForge AI uses OpenRouter for AI-assisted ticket polishing.

AI should help convert raw founder thoughts into structured, editable, reviewable build requests. The founder remains in control before anything is published.

---
## 🚆 Railway Deployment

Railway is the temporary production host for BlueprintForge AI. The app deploys as a normal Node/Express production web app; it does not depend on a hosted IDE or provider-specific runtime.

1. Connect the GitHub repository to a Railway project.
2. Deploy from the `main` branch.
3. Set environment variables in Railway:
   - `OPENROUTER_API_KEY` — required for OpenRouter AI features.
   - `NODE_ENV=production` — required so Express serves the production build.
   - `GITHUB_TOKEN` — required only if GitHub automation is enabled.
   - `DATABASE_URL` — required only if the active persistence layer uses it.
   - `APP_URL` — recommended canonical Railway service URL.
4. Set the build command to `npm run build`.
5. Set the start command to `npm run start`.
6. Do not set `PORT` manually; Railway provides it automatically. The server listens on `0.0.0.0:$PORT`.
7. After deployment, check `https://<your-railway-domain>/health` for a JSON health response.

See [`docs/RailwayDeployment.md`](docs/RailwayDeployment.md) for the full deployment runbook.

---

## 🔔 Version Updates

When a new BlueprintForge AI version is deployed, builders should receive an in-app popup with:

- version number
- release date
- changelog summary
- link to the changelog
- acknowledgement state

Each builder should only see each version popup once after acknowledgement.

---

## 🧪 Demo Mode

Demo mode must use safe demo data only.

Demo users should never mutate production data. Demo recorder and walkthrough flows are for showcasing the product safely.

---

## ✅ Contribution Philosophy

- Read `/Agent.md` first
- Treat Railway as the temporary production host
- Treat OpenRouter as the AI provider
- Do not reintroduce provider-specific deployment assumptions
- Keep changes small and focused
- Reuse existing patterns
- Protect role-based actions
- Never expose secrets
- Prefer clear UX over clever UI
- Document important functions
- Make every user state understandable
- Ship useful work

---

## ⭐ Support the Project

If you believe in founder-led open-source execution:

- star the repository
- share the project
- claim a build request
- open a pull request
- help turn vision into shipped product

---

## 🧱 Status

BlueprintForge AI is actively evolving. Expect rapid iteration, new build requests, changing priorities, and continuous improvements.

This repository is the build ground for the platform itself.
