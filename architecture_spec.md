# BlueprintForge AI — Data Architecture & API Specification

## 1. Executive Summary
This document outlines the robust data architecture for BlueprintForge AI. It transitions the application from a semi-persistence (LocalStorage) state to a production-grade Firebase Firestore environment.

## 2. User Roles & Permissions Matrix

| Capability | Admin (Founder) | Builder (Coder) | Visitor (Guest) | Demo User |
| :--- | :---: | :---: | :---: | :---: |
| View Landing/Bootstrap | ✅ | ✅ | ✅ | ✅ |
| View Build Feed | ✅ | ✅ | ✅ (Limited) | ✅ |
| View Vision/Roadmap | ✅ | ✅ | ✅ | ✅ |
| Create Build Request | ✅ | ❌ | ❌ | ❌ |
| Claim Build Request | ✅ | ✅ | ❌ | ✅ (Sandbox) |
| Submit PR / Update | ✅ | ✅ (Own Only) | ❌ | ❌ |
| Award Star | ✅ | ❌ | ❌ | ❌ |
| Modify App Settings | ✅ | ❌ | ❌ | ❌ |
| Manage Profiles | ✅ | ❌ | ❌ | ❌ |

## 3. Database Schema (Firestore Collections)

### `profiles` (Sub-collection of `/users/`)
Identity and role management.
- `role`: 'admin' | 'builder' | 'visitor'
- `email_verified`: boolean
- `created_at`: timestamp

### `vibe_coder_profiles`
Detailed builder information.
- `user_id`: string (Relational)
- `username`: string (Unique)
- `skills`: string[]
- `stars_count`: number (Denormalized)
- `github_url`: string

### `build_requests`
The core ticket entity.
- `polished_title`: string
- `status`: 'Open' | 'Claimed' | 'In Progress' | 'Review' | 'Done'
- `claimed_by`: string (UID)
- `github_issue_url`: string
- `is_current_focus`: boolean

### `founder_visions`
Directional strategy docs.
- `vision_statement`: string
- `goals`: string[]

### `app_versions` & `guide_sections`
CMS layer for the Living Guide.
- `version`: string
- `release_notes`: string
- `sections_json`: string

## 4. API Contracts (Services)

### Auth & Profiles
- `getProfile()`: Fetches current user role and settings.
- `updateBuilderProfile(data)`: Updates the specialized coder profile.
- `listBuilders()`: Directory listing.

### Build Engine
- `createBuildRequest(rawInput)`: Calls AI to polish, then stores in Firestore.
- `claimTicket(requestId)`: Atomically updates ticket and creates a `build_request_updates` log.
- `awardStar(profileId, requestId)`: Increments star count and logs event.

### GitHub Integration (Server Proxy)
- `syncIssue(requestId)`: Triggers issue creation and links it back to the ticket.

## 5. Security & Persistence Strategy
- **Master Gate**: Access to build requests is restricted based on status and claiming user.
- **Atomic Guarantees**: Stars and Claims use `runTransaction` to prevent double-claiming or star-poisoning.
- **Immutability**: `createdAt` and `ownerId` fields are locked after creation.
- **Validation**: All string fields have `.size()` limits to prevent "Denial of Wallet" attacks.

## 6. Implementation Roadmap
1. **Bootstrap Phase**: Setup `firebase-blueprint.json` and deploy rules.
2. **Persistence Phase**: Migrate local hooks (`useBuildFeed`, `useGuide`) to Firestore services.
3. **Security Phase**: Implement Role-Based Access Control (RBAC) in frontend guards.
4. **Audit Phase**: Enable `audit_logs` for sensitive admin actions.
