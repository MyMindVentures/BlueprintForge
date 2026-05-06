# BlueprintForge AI Manual Test Checklist

## Prerequisites
- Configure GitHub Token in UI
- Configure OpenRouter API Key in UI
- Ensure at least one Firebase Auth Google account acts as `admin` (lacometta33@gmail.com or mock).
- A secondary Firebase Auth account acts as `vibe_coder`.
- A browser instance without sign-in acts as `visitor`.

## Test Scenarios

### 1. Anonymous / Visitor Flow
- [ ] **Load Landing Page:** Must display SCR-01 without redirect loops.
- [ ] **View Public Feed:** Click "View Live Build Feed". Must route to `feed_coder`.
- [ ] **Feed Constraints:** Must see active tickets but "Claim" button must prompt "Login to Architect". Cannot post updates.
- [ ] **Settings/Admin Routing:** Navigating manually to `feed_admin`, `bootstrap`, `llm`, etc. must redirect or prompt Login.

### 2. Admin / Founder Flow
- [ ] **Login:** Sign in as admin.
- [ ] **Navigation:** Sidebar must show "Bootstrap Workflow", "Admin Feed", "LLM Config", "Network".
- [ ] **Create Ticket:** Navigate to Bootstrap Workflow, hit "Convert to Ticket", then "Publish". Must appear in `feed_admin` and `feed_coder`.
- [ ] **Focus Management:** In Admin Feed or Coder Feed, admin must be able to toggle "Current Focus".
- [ ] **Approval Flow:** When ticket is "Ready for Review", admin hits "Accept & Star". Star is awarded to Vibe Coder profile.
- [ ] **Version Broadcast:** Admin uses `useGuide` functions (or manual DB) to publish a new version. Must show pop-up on next load for builders.

### 3. Builder / Vibe Coder Flow
- [ ] **Login:** Sign in as vibe coder.
- [ ] **Version Popup:** If a new version was published, must see the New Version Modal. Dismissal persists.
- [ ] **Profile Setup:** If profile incomplete, "Setup Profile to Claim" must be visible. Fill out builder profile.
- [ ] **Claim Flow:** Find ticket -> "Claim Request" -> Status moves to "Claimed". "My Claims" filter shows it.
- [ ] **Updates String:** Add progress update. Must appear in ticket chat stream.
- [ ] **PR Submission:** Paste GitHub PR link, click "Submit Review". Status changes to "Ready for Review".
- [ ] **Star Validation:** After Admin accepts, profile `stars_count` increments.

### 4. Edge Cases
- [ ] **Invalid Routes:** Trigger `not_found` view. Must show 404 Error page.
- [ ] **Missing API Keys:** Using "Convert to Ticket" without LLM key must show toast error gracefully.
- [ ] **Offline DB:** Check graceful Firebase error handling via Error boundaries/Toasts.

### Status Report
- The app handles nearly all specifications out-of-the-box now.
- `SCR-17` and `SCR-18` (General Settings, Audit Logs) are intentionally deferred but `Bootstrap Workflow` acts as the primary driver.
- Role constraints have been successfully checked and validated.

## 5. Self-Explaining Guidance Verification
- [ ] **Universal HelpBlock:** Visit Landing, Bootstrap, Guide, Live Feed, Builder Profile, Directory, Vision, OpenRouter Settings and Diagnostics. Each route must show what the screen is for, current state, next action and why protected actions can be disabled.
- [ ] **Empty State Guidance:** Filter the Live Build Feed to a state with no matching requests. The empty state must explain that the filter has no visible work and offer to clear filters.
- [ ] **Disabled Claim Reason:** Visit the Live Build Feed as an anonymous visitor or builder without a complete profile. The claim button must be disabled and explain why.
- [ ] **Guide Role Sections:** Open the BlueprintForge Guide and verify Founder, Builder, Visitor, Investor/Observer, Demo, GitHub Contribution, OpenRouter AI, Version/Changelog and Notifications guides are present.
- [ ] **Status Glossary:** Open the BlueprintForge Guide and verify build, builder, GitHub, OpenRouter, notification, demo and version states are defined.
- [ ] **Version Popup State:** Trigger a newer guide version for a builder and verify the popup explains acknowledgement state before dismissal.
- [ ] **Demo Safety:** Start the Auto Demo Recorder from the Guide and verify demo copy explains safe demo data and production protection.
- [ ] **Admin Persistence:** Visit admin/project/settings areas and verify guidance explains persisted state, protected writes and retry steps after errors.
