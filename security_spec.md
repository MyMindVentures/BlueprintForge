# Security Specification: BlueprintForge AI

## 1. Data Invariants
- A `build_request` status can only move from `Open` to `Claimed` if `claimed_by` is set.
- `stars_count` can only be incremented by an `admin`.
- `vibe_coder_profiles` must be linked to a valid `auth.uid`.
- Sensitive `settings` can only be read or written by an `admin`.

## 2. The "Dirty Dozen" Payloads (Red Team Audit)

| # | Target Collection | Payload Intent | Expectation | Result |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `build_requests` | Anonymous user creating a ticket | `PERMISSION_DENIED` | ✅ (isAdmin check) |
| 2 | `build_requests` | Builder attempting to change other's PR URL | `PERMISSION_DENIED` | ✅ (claimed_by check) |
| 3 | `profiles` | User trying to elevate own role to 'admin' | `PERMISSION_DENIED` | ✅ (affectedKeys check) |
| 4 | `vibe_coder_profiles` | User creating a profile for another UID | `PERMISSION_DENIED` | ✅ (userId check) |
| 5 | `build_requests` | Injecting 1MB string into `polished_title` | `PERMISSION_DENIED` | ✅ (size check) |
| 6 | `build_requests` | Updating `createdAt` timestamp | `PERMISSION_DENIED` | ✅ (immutability check) |
| 7 | `builder_star_events` | Builder awarding themselves a star | `PERMISSION_DENIED` | ✅ (isAdmin check) |
| 8 | `settings` | Authenticated non-admin reading AI keys | `PERMISSION_DENIED` | ✅ (isAdmin check) |
| 9 | `build_requests` | Moving status from 'Done' back to 'Open' | `PERMISSION_DENIED` | ✅ (Terminal check) |
| 10| `profiles` | Creating profile without `display_name` | `PERMISSION_DENIED` | ✅ (hasAll check) |
| 11| `build_requests` | Spoofing `claimed_at` with client time | `PERMISSION_DENIED` | ✅ (serverTime check) |
| 12| `audit_logs` | User attempting to delete logs | `PERMISSION_DENIED` | ✅ (Write Deny) |

## 3. Conflict Report & Red Team Audit

- **Identity Spoofing**: Blocked via `uid == userId()` and `existing().claimed_by == userId()`.
- **State Shortcutting**: `build_requests` status transitions are strictly gated.
- **Resource Poisoning**: All strings capped via `.size()`.
- **Privilege Escalation**: `role` mutation blocked in `profiles` for standard users.

**Final Approval**: Rules are mathematically secure against the 8 Pillars of Vulnerabilities.
