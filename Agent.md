# Agent.md

## Project Identity
- **Name**: BlueprintForge AI
- **Type**: bootstrap open-source execution platform
- **Core loop**: founder thought → AI-polished ticket → live build request → GitHub issue → builder claim → PR → review → stars/reputation

## Mandatory Agent Behavior
- Always read Agent.md before coding
- Never ignore existing patterns
- Prefer small, safe, incremental changes
- Keep code readable and maintainable
- Do not remove existing functionality unless explicitly asked
- Do not hardcode secrets
- Use environment variables for API keys
- Keep public and admin functionality separated
- Respect role-based access control

## Architecture Rules
- Reuse existing components where possible
- Keep screen logic, data logic and UI components separated
- Use clear naming based on SCR, CAP and FUNC references when useful
- Create reusable modules instead of duplicated logic
- Add comments only where they clarify important decisions

## Security Rules
- Never expose OpenRouter API keys in frontend code
- Never expose GitHub tokens in frontend code
- Validate user roles before protected actions
- Treat founder/admin actions as protected
- Treat demo data as isolated from production data

## Deployment Rules
- Railway is the temporary production host for BlueprintForge AI
- Provider-specific hosted IDE/runtime deployment is no longer the target
- Deploy as a normal production Node/Express web app
- Production services must listen on `0.0.0.0` and `process.env.PORT || 3000`
- Use OpenRouter as the AI provider
- Keep `OPENROUTER_API_KEY`, `GITHUB_TOKEN`, and `DATABASE_URL` server-side only
- Vite may expose only explicitly safe public variables with the `VITE_` prefix

## Data Persistence Rules
- Important app data must persist
- Build requests, builder profiles, claims, PR links, stars, versions and guide content must not be temporary-only
- Add audit logs for important admin actions where possible

## GitHub Workflow Rules
- Build requests can become GitHub issues
- Store GitHub issue links
- Track claim, fork, branch and PR URL flow
- Accepted PRs can award stars

## AI/OpenRouter Rules
- Use OpenRouter only for AI features
- AI should polish founder thoughts into build-ready tickets
- AI output should be structured, editable and reviewable before publishing

## Multilingual Rules
- The app must support multilingual UI
- Do not hardcode user-facing text if an i18n system exists
- Run `npm run i18n:check` when changing frontend `.tsx` UI copy; move visible JSX text and user-facing `label`, `title`, `placeholder`, `aria-label`, `description`, `emptyMessage`, `error`, and `success` prop values into i18n resources unless they are documented internal exceptions.

## Demo Rules
- Demo recorder and demo user must only use safe demo data
- Demo data seeding/resetting must not affect real production data

## Definition of Done
- Feature works
- Existing behavior is not broken
- Role access is respected
- Data is persisted where required
- UI is consistent
- Code follows Agent.md
- No secrets are exposed
