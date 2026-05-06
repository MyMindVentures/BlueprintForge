# BlueprintForge AI — Full Product Blueprint

## 1. App Concept
BlueprintForge AI is a bootstrap platform where a visionary founder turns raw thoughts, goals, app concepts, product ideas and improvement requests into structured, build-ready tickets that vibe coders can claim, implement and ship through GitHub.

The platform is built around the relationship between The Architect and The Builders. The founder brings vision, direction, concepts and product energy. Builders bring execution, code, structure and reality.

BlueprintForge AI helps the founder share high-level visions, showcase app concepts, publish live build requests, create GitHub issues automatically, onboard vibe coders, track contributor reputation, and evolve the platform through open-source implementation.

The app includes a Live Build Feed, Founder Vision layer, Bootstrap Page, Vibe Coder Network, GitHub contribution flow, stars/reputation system, public landing experience, multilingual support, OpenRouter AI integration, database persistence, and an auto-updated BlueprintForge Guide with demo recording support.

The goal is to attract vibe coders, digital nomads, builders, contributors and potential investors by making the founder’s thinking visible, structured and actionable.

BlueprintForge AI is not only an app. It is a living proof-of-mind system where vision becomes tickets, tickets become GitHub issues, builders turn issues into pull requests, and accepted work improves the platform.

## 2. Screens
- **SCR-01**: Landing Page - Introduction to the open-source platform.
- **SCR-02**: Main Architect Dashboard - Summary of all tickets and metrics.
- **SCR-03**: Builder Dashboard - Overview of available tickets and reputation.
- **SCR-04**: Sign-Up Screen - Account creation via GitHub or Email.
- **SCR-05**: Login Screen - User authentication.
- **SCR-06**: Bootstrap Workflow Input - Founder types raw thoughts here.
- **SCR-07**: AI Ticket Polish Review - Adjust and review structured ticket.
- **SCR-08**: Live Build Feed (Public) - View all active and pending tickets.
- **SCR-09**: Live Build Feed (Admin) - Management of requests and priority.
- **SCR-10**: Ticket Detail View - Deep dive on a single build request.
- **SCR-11**: GitHub PR Sync Modal - View attached PRs for a ticket.
- **SCR-12**: Builder Profile Creation - Set up skills and availability.
- **SCR-13**: Builder Profile View - Public view of a vibe coder's reputation.
- **SCR-14**: Builder Network Directory - Search and filter available builders.
- **SCR-15**: Founder Vision Board - High-level strategic documentation.
- **SCR-16**: Settings: OpenRouter Config - Add and test API keys.
- **SCR-17**: Settings: General & I18N - Manage platform language and UI.
- **SCR-18**: Audit Logs View - View a chronological log of system actions.
- **SCR-19**: BlueprintForge Guide - Living documentation and standard guide.
- **SCR-20**: Demo User Sandbox - A safe area for demo user recording.
- **SCR-21**: Star Award Modal - Award stars to an accepted PR's author.
- **SCR-22**: Claim Ticket Modal - Interface for coders to lock a ticket.
- **SCR-23**: My Claims Workspace - Builder's specific active tickets.
- **SCR-24**: Error & 404 Pages - Polite fallback screens.
- **SCR-25**: Terms, Privacy & Guidelines - Static policy documentation.

## 3. User Roles
- **ROLE-01**: The Architect / Founder - Can create/polish tickets, award stars, manage the vision.
- **ROLE-02**: Vibe Coder / Builder - Can claim tickets, submit PRs, and earn stars.
- **ROLE-03**: Public Visitor - Read-only access to feeds and directory.
- **ROLE-04**: Demo User - Sandboxed account that resets its state.
- **ROLE-05**: Verified Core Team - Trusted builders with minor admin capabilities.
- **ROLE-06**: Investor / Sponsor - Specially badged user tracking project velocity.

## 4. Capabilities
- **CAP-01**: User Authentication & Authorization.
- **CAP-02**: AI Text Parsing & Structuring (OpenRouter).
- **CAP-03**: GitHub OAuth Integration.
- **CAP-04**: GitHub Webhook Receiving & Parsing.
- **CAP-05**: Live Datastore Synchronisation (Firestore).
- **CAP-06**: Live Ticket Feed Broadcasting.
- **CAP-07**: Role-based View Rendering.
- **CAP-08**: Multi-language (I18N) Rendering.
- **CAP-09**: Builder Profile Management & Storage.
- **CAP-10**: Demo Data Generation & State Reset.
- **CAP-11**: Interactive Star / Reputation Calculation.
- **CAP-12**: Markdown Processing & Rendering.
- **CAP-13**: Issue Claim Locking Mechanism.
- **CAP-14**: Admin Audit Trailing.
- **CAP-15**: Pull Request Status Polling.
- **CAP-16**: Secure Environment Variable Management.
- **CAP-17**: UI Error Catching & Toast Notifications.
- **CAP-18**: Input Rate Limiting.
- **CAP-19**: Data Pagination & Filtering.
- **CAP-20**: Search Functionality across tickets.
- **CAP-21**: AI Model Selection Preferences.
- **CAP-22**: Dark/Light Theme Support.
- **CAP-23**: Versioning of Blueprint Guide.
- **CAP-24**: Push/Email Notifications Concept (Hooks).
- **CAP-25**: Image / Asset Storage Management.
- **CAP-26**: Ticket Tagging & Categorization.
- **CAP-27**: Auto-save Draft Capability.
- **CAP-28**: Founder Vision Linkage to Tickets.
- **CAP-29**: Social Sharing of Tickets.
- **CAP-30**: Data Export / Backup.
- **CAP-31**: Secure Serverless Endpoint Triggers.
- **CAP-32**: Analytics & Event Tracking Integration.
- **CAP-33**: Ticket Priority & Difficulty Indexing.
- **CAP-34**: Demo Session Recording API.
- **CAP-35**: Real-time presence detection (Who's online).

## 5. Functions
- **FUNC-01**: `loginUserWithGithub()`
- **FUNC-02**: `loginUserWithProvider()`
- **FUNC-03**: `logoutUser()`
- **FUNC-04**: `getCurrentUserRole()`
- **FUNC-05**: `validateAdminAccess()`
- **FUNC-06**: `submitRawThought()`
- **FUNC-07**: `callOpenRouterAPI()`
- **FUNC-08**: `parseAITicketJSON()`
- **FUNC-09**: `savePolishedTicketDraft()`
- **FUNC-10**: `publishLiveBuildRequest()`
- **FUNC-11**: `fetchActiveBuildRequests()`
- **FUNC-12**: `filterBuildRequestsByStatus()`
- **FUNC-13**: `claimBuildRequest()`
- **FUNC-14**: `unclaimBuildRequest()`
- **FUNC-15**: `updateTicketStatus()`
- **FUNC-16**: `syncTicketWithGithubIssue()`
- **FUNC-17**: `parseGithubPRStatus()`
- **FUNC-18**: `attachPRToTicket()`
- **FUNC-19**: `listBuilderProfiles()`
- **FUNC-20**: `createBuilderProfile()`
- **FUNC-21**: `updateBuilderProfileData()`
- **FUNC-22**: `fetchBuilderReputation()`
- **FUNC-23**: `awardStarToBuilder()`
- **FUNC-24**: `calculateBuilderLevel()`
- **FUNC-25**: `submitFounderVision()`
- **FUNC-26**: `updateFounderVision()`
- **FUNC-27**: `fetchFounderVisions()`
- **FUNC-28**: `saveLLMSettings()`
- **FUNC-29**: `testOpenRouterConnection()`
- **FUNC-30**: `fetchAvailableAIModels()`
- **FUNC-31**: `changeAppLanguage()`
- **FUNC-32**: `loadI18NDictionary()`
- **FUNC-33**: `seedDemoData()`
- **FUNC-34**: `resetDemoUserEnvironment()`
- **FUNC-35**: `startDemoSessionRecording()`
- **FUNC-36**: `stopDemoSessionRecording()`
- **FUNC-37**: `publishDemoRecording()`
- **FUNC-38**: `fetchBlueprintForgeGuide()`
- **FUNC-39**: `createNewGuideVersion()`
- **FUNC-40**: `renderMarkdownToHTML()`
- **FUNC-41**: `logAdminActionToAudit()`
- **FUNC-42**: `fetchAuditLogs()`
- **FUNC-43**: `triggerToastNotification()`
- **FUNC-44**: `clearErrorStates()`
- **FUNC-45**: `validateTicketSchema()`
- **FUNC-46**: `assignTicketPriority()`
- **FUNC-47**: `searchTicketsByKeyword()`
- **FUNC-48**: `filterTicketsByDifficulty()`
- **FUNC-49**: `paginateDirectoryResults()`
- **FUNC-50**: `toggleThemeMode()`
- **FUNC-51**: `uploadBuilderAvatar()`
- **FUNC-52**: `deleteBuilderProfile()`
- **FUNC-53**: `checkUserSessionValidity()`
- **FUNC-54**: `refreshAuthToken()`
- **FUNC-55**: `exportTicketAsJSON()`
- **FUNC-56**: `exportVisionAsMarkdown()`
- **FUNC-57**: `shareTicketViaLink()`
- **FUNC-58**: `markTicketAsReviewing()`
- **FUNC-59**: `markTicketAsDone()`
- **FUNC-60**: `reopenTicket()`
- **FUNC-61**: `addCommentToTicket()`
- **FUNC-62**: `fetchTicketComments()`
- **FUNC-63**: `deleteTicketComment()`
- **FUNC-64**: `fetchSystemMetrics()`
- **FUNC-65**: `trackPageNavigation()`
- **FUNC-66**: `generateAnalyticsReport()`
- **FUNC-67**: `verifyGithubWebhookSignature()`
- **FUNC-68**: `processGithubIssueHook()`
- **FUNC-69**: `processGithubPRHook()`
- **FUNC-70**: `autoAssignIssueToClaimant()`
- **FUNC-71**: `subscribeToFeedUpdates()`
- **FUNC-72**: `unsubscribeFromFeedUpdates()`
- **FUNC-73**: `checkSystemHealth()`
- **FUNC-74**: `sendEmailNotification()`
- **FUNC-75**: `scheduleTicketReminder()`
- **FUNC-76**: `generateInviteLink()`
- **FUNC-77**: `validateInviteToken()`
- **FUNC-78**: `assignUserToCoreTeam()`
- **FUNC-79**: `revokeBuilderAccess()`
- **FUNC-80**: `fetchOnlinePresence()`
- **FUNC-81**: `broadcastPresenceHeartbeat()`

## 6. Legend
- **SCR** = Screen
- **ROLE** = User Role
- **CAP** = Capability
- **FUNC** = Function
