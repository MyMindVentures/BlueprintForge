# User Guidance System

## Purpose

BlueprintForge AI now includes a reusable self-explaining guidance layer so users can always answer:

- What is this screen for?
- What state am I in?
- What action is available next?
- Why is an action disabled?
- What happened after success?
- What should I do after an error or empty state?

## Help components added

| Component | Purpose |
| --- | --- |
| `src/components/help/HelpBlock.tsx` | Reusable screen-level explanation with purpose, current state, next action and disabled-action reason. |
| `src/components/help/TooltipHelp.tsx` | Reusable inline/focus/hover tooltip for controls that need short contextual explanation. |

## State components added

| Component | Purpose |
| --- | --- |
| `src/components/state/LoadingState.tsx` | Explains what the app is loading and when actions will unlock. |
| `src/components/state/ErrorState.tsx` | Shows what went wrong and a recovery next step. |
| `src/components/state/SuccessState.tsx` | Confirms completed actions and can point users to the next action. |

The app also keeps the existing `src/components/ui/EmptyState.tsx` for empty screens and feature lists.

## Status badges added / expanded

`src/components/ui/StatusBadge.tsx` now supports a shared vocabulary for:

- Build requests: Draft, Published, Open, Claimed, In Progress, PR Submitted / Ready for Review, In Review, Changes Requested, Accepted, Rejected, Archived.
- Builder profiles: Incomplete, Complete, Verified, Not Verified, Eligible to Claim, Not Eligible to Claim.
- GitHub: Repo Not Connected, Repo Connected, Issue Pending, Issue Created, Issue Failed, PR Waiting, PR Submitted, PR Reviewed.
- OpenRouter: Not Configured, Configured, Connection Untested, Connected, Connection Failed, Model Synced.
- Notifications: Unread, Read, Action Required.
- Demo: Demo Mode, Demo Data Active, Production Protected.
- Version/changelog: Draft Version, Published Version, Latest Version, Acknowledged, Not Yet Acknowledged.

A compatibility re-export exists at `src/components/status/StatusBadge.tsx` for the requested central status path.

## Guide content added

Central guide content lives in `src/content/guides/blueprintGuides.ts` and includes:

1. Founder Guide
2. Builder Guide
3. Visitor Guide
4. Investor / Observer Guide
5. Demo Guide
6. GitHub Contribution Guide
7. OpenRouter AI Guide
8. Version / Changelog Guide
9. Notifications Guide

The same content also includes:

- Screen guidance for Landing Page, Bootstrap Page, Live Build Feed, Builder Profile, OpenRouter/GitHub Settings, BlueprintForge Guide and Admin Database/Persistence Layer.
- Status/state glossary used by the Guide screen.
- Empty, loading, error and success explanations per major screen family.

## BlueprintForge Guide updates

The Guide screen now shows:

- Role guides with next actions.
- Screen and state explanations.
- Status/state glossary.
- FAQ section.
- Existing version/changelog information.
- Existing standard user flows.
- Existing demo recorder entry point.

## How users are guided per role

### Founder / Admin

- The Bootstrap Page guidance explains raw thought entry, OpenRouter dependency, draft review and publishing state.
- The Live Build Feed guidance explains status review, Current Founder Focus, builder work review and star awards.
- The settings guidance explains OpenRouter/GitHub configuration and why integration actions are disabled when credentials or repo settings are missing.
- The admin persistence guidance explains which records are shared and why founder/admin access is required.

### Builder

- The Builder Guide explains profile completion, claim eligibility, GitHub issue links, progress updates, PR URLs and stars.
- The Live Build Feed guidance explains why claim buttons can be disabled for visitors, incomplete profiles, already claimed tickets or non-open statuses.
- The version/changelog guide explains popup acknowledgement state.

### Visitor

- The Visitor Guide explains read-only access and how to become a builder.
- Public screens state that protected actions require sign-in so users know what is available next.

### Investor / Observer

- The observer guide explains how to read Founder Vision, Daily Signal, Current Founder Focus, accepted work and builder reputation as platform momentum.

### Demo user

- The Demo Guide explains Demo Mode, Demo Data Active and Production Protected labels.
- The Guide screen exposes the Auto Demo Recorder entry point and documents that demo data must stay separate from production.

## Implementation notes

- The universal `HelpBlock` is rendered from `src/App.tsx` for every major routed view, so each screen has a visible purpose, state, next action and disabled-action explanation.
- Content is centralized in `src/content/guides/blueprintGuides.ts` instead of scattering large text across individual screens.
- Status text is honest when behavior is not fully connected yet; the guidance uses “Not Configured,” “Connection Untested,” “Not connected yet,” or “Pending implementation” style labels rather than pretending backends are complete.
