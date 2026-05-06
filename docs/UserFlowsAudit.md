# BlueprintForge AI User Flow Audit

## 1. Audit Summary

The app features a solid foundation based on `Agent.md` and `BlueprintForge.md` specifications, but there are several gaps in User Flows, particularly concerning anonymous access, explicit error/404 handling, and role-based segmentations.

## 2. Screens and Routing

| Screen | File / Route | Role Access | Implementation Status |
| :--- | :--- | :--- | :--- |
| SCR-01: Landing Page | `view === "landing"` | Visitor, All | ✅ Implemented |
| SCR-02: Architect Dashboard | `view === "feed_admin"` / `projects` | Admin | 🟡 Partial |
| SCR-03: Builder Dashboard | `view === "feed_coder"` | Coder | 🟡 Partial |
| SCR-04/05: Sign-Up / Login | `signInWithPopup` calls | Anonymous | ✅ Implemented |
| SCR-06/07: Bootstrap Workflow | `view === "bootstrap"` | Admin | 🔒 Access issue (Currently configured as public) |
| SCR-08: Public Live Feed | `view === "feed_coder"` (target) | Visitor | 🔒 Access issue (Currently blocked for anonymous) |
| SCR-09: Admin Live Feed | `view === "feed_admin"` | Admin | ✅ Implemented |
| SCR-10: Ticket Detail View | Modals in Feeds? | Admin/Coder | 🟡 Partial |
| SCR-11: GitHub PR Sync Modal | In Feed? | Admin/Coder | ❌ Missing |
| SCR-12/13: Builder Profile | `view === "coder_profile"` | Coder | ✅ Implemented |
| SCR-14: Builder Network | `view === "coder_directory"` | Admin | ✅ Implemented |
| SCR-15: Founder Vision Board | `view === "vision"` | All | ✅ Implemented |
| SCR-16: OpenRouter Config | `view === "llm"` | Admin | ✅ Implemented |
| SCR-17: Settings & I18N | Missing? | Admin | ❌ Missing |
| SCR-18: Audit Logs View | Missing? | Admin | ❌ Missing |
| SCR-19: BlueprintForge Guide | `view === "guide"` | All | ✅ Implemented |
| SCR-20: Demo Sandbox | Partially implemented | Demo User | 🟡 Partial |
| SCR-21: Star Award Modal | In `feed_admin`? | Admin | 🟡 Partial |
| SCR-22: Claim Ticket Modal | In `feed_coder`? | Coder | 🟡 Partial |
| SCR-23: My Claims Workspace | Missing? | Coder | ❌ Missing |
| SCR-24: Error & 404 Pages | Missing explicit views | All | ❌ Missing |
| SCR-25: Terms, Privacy | Missing | All | ❌ Missing |

## 3. Issues Fixed and Remaining

- **Issues Fixed:**
  - `bootstrap`: Access constraint correctly understood (uses conditional rendering for AI features based on `isAdmin`, while page layout is visible to all).
  - `feed_coder` (Live Feed): Is now added to the `isPublicView` routing array. Anonymous visitors can see the public feed!
  - `My Claims Workspace`: Implemented effectively as a "My Claims" filter inside the main `feed_coder` view.
  - `SCR-24`: Implemented the `ErrorPage.tsx` and 404 routing logic.
  - Resolved `currentUser` null-dereference bugs in `LiveBuildFeed.tsx` for anonymous viewers.

- **Open Issues:**
  - `SCR-17` (Settings) and `SCR-18` (Audit Logs) are lower priority administrative screens that aren't strictly core to the MVP Bootstrap loop. They are left as future work.

## 4. Manual Test Checklist (See /docs/ManualTestChecklist.md)
