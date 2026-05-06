# BlueprintForge I18n Audit

## Audit scope

This audit covers the current application internationalization implementation and the visible UI/source areas most likely to contain user-facing copy.

| Area | Files / paths scanned | Notes |
| --- | --- | --- |
| I18n core | `src/i18n/config.ts`, `src/i18n/I18nProvider.tsx`, `src/i18n/LanguageSelector.tsx` | Defines supported languages, in-memory resources, translation lookup, formatting helpers and language selector UI. |
| Locale files | `locales/*/common.json` | Ten locale folders share one `common` namespace. |
| App shell and routing | `src/App.tsx`, `src/components/layout/*` | Main provider wiring, route guidance, navigation, landing page, error/new-version surfaces. |
| Feature screens | `src/components/buildFeed/*`, `src/components/bootstrap/*`, `src/components/guide/*`, `src/components/projects/*`, `src/components/agents/*`, `src/components/models/*`, `src/components/vision/*` | Highest concentration of hardcoded product and workflow copy. |
| Shared UI/state | `src/components/ui/*`, `src/components/state/*`, `src/components/status/*`, `src/components/help/*`, `src/components/pipeline/*`, `src/components/markdown/*` | Reusable components and progress/status messages. |
| Persistence/API | `src/server/api.ts`, `src/server/repositories/userRepository.ts`, `src/types/buildFeed.ts`, `migrations/001_initial_postgres.sql`, `migrations/003_user_preferred_language.sql` | Stores preferred language on user profiles and local storage. |

## I18n library status

- **Status:** Custom React context implementation, not a third-party i18n package.
- **Chosen runtime:** `I18nProvider` exposes `language`, `locale`, `setLanguage`, `t`, `formatDate`, `formatNumber` and `formatRelativeTime`.
- **Resource loading:** All JSON resources are statically imported in `src/i18n/config.ts`; there is no lazy loading or namespace chunking.
- **Supported languages:** `en`, `nl`, `fr`, `de`, `es`, `pt`, `it`, `pl`, `hi`, `ja`.
- **Namespace model:** One namespace exists: `common.json` per locale. Keys are nested by domain inside that file.
- **Translation features available:** Dot-path lookup, English fallback and simple `{{token}}` interpolation.
- **Translation features missing:** Pluralization, gender/context variants, rich text components, ICU message syntax, extraction tooling, missing-key reporting, pseudolocale testing and RTL-aware direction selection.

## Hardcoded text locations

Hardcoded user-facing copy remains widespread. The following areas should be prioritized because they render large blocks of visible text or important action labels:

| Priority | File / area | Examples of hardcoded copy | Risk |
| --- | --- | --- | --- |
| High | `src/components/bootstrap/BootstrapPage.tsx` | Hero, founder story, workflow sections, CTA labels, form labels and placeholders | Public onboarding is only partially controlled by locale files. |
| High | `src/components/guide/GuidePage.tsx` and `src/components/guide/AutoDemoRecorder.tsx` | Guide headings, release section labels, demo recorder labels, help text | Documentation-like UI remains English-first even when navigation changes language. |
| High | `src/components/buildFeed/LiveBuildFeed.tsx` | Feed title/subtitle, stats, filters, empty states, ticket labels, claim/review copy | Core builder workflow mixes localized status formatting with English UI copy. |
| High | `src/components/buildFeed/LiveBuildFeedAdmin.tsx` | Founder command center, raw input flow, polish/publish buttons, daily signal UI | Admin workflow copy is not consistently localizable. |
| High | `src/components/buildFeed/BuilderProfile.tsx`, `VibeCoderDirectory.tsx`, `DailySignal.tsx`, `StartHere.tsx`, `CurrentFocus.tsx` | Profile field labels, access-denied messages, onboarding text, directory labels | Builder onboarding and directory are English-only in many places. |
| High | `src/components/projects/*` | Dashboard headings, project/editor labels, raw concept form, image gallery, output tab actions | Project creation workflow has many hardcoded labels and dynamic messages. |
| High | `src/components/agents/*` | Agent list/card/editor headings, form labels, status text | Agent management screens bypass namespace coverage. |
| Medium | `src/components/models/*` | OpenRouter settings and diagnostics copy | Technical settings are mostly English-only. |
| Medium | `src/components/vision/FounderVisionPage.tsx` | Vision headings, statuses, form labels and empty states | Product strategy screen only partially imports i18n. |
| Medium | `src/components/layout/LandingPage.tsx`, `NewVersionPopup.tsx`, `ErrorPage.tsx` | Mission statement, version popup labels, 404 copy | Landing uses i18n for the top hero but includes a large Dutch/English narrative outside locale files. |
| Medium | `src/components/pipeline/*` | Pipeline status labels, progress headings, retry/asset actions | Runtime progress messaging is English-first. |
| Low | `src/components/ui/*`, `src/components/state/*`, `src/components/help/*` | Default placeholders, dialog/action state labels, help headings | Shared components can leak English defaults into every screen. |
| Low | Tests and examples | `*.test.tsx` fixture strings | Usually acceptable unless snapshot assertions are used as source copy. |

## Missing keys

- **Cross-locale parity:** No missing keys were found between `locales/en/common.json` and the other nine `common.json` files. Each locale currently contains 167 flattened keys.
- **Missing from namespace:** Many rendered strings are not represented in any locale file. The largest missing key groups are:
  - `bootstrap.*` extended hero/story/workflow/body copy beyond the existing bootstrap subset.
  - `guide.*` release notes, anatomy sections, demo-recorder labels and long-form guide content.
  - `buildFeed.*` ticket card labels, filters, stats, claim/review/update flows and admin command center copy.
  - `builderProfile.*`, `builderDirectory.*`, `dailySignal.*`, `currentFocus.*` and `startHere.*` dedicated namespaces or nested groups.
  - `projects.*`, `agents.*`, `models.*`, `vision.*`, `pipeline.*`, `shared.*` keys for feature screens and reusable UI.
- **Missing-key behavior:** If a key does not resolve in the active language or English, `t(key)` returns the key itself. This avoids crashes but can expose raw implementation keys to users.

## Components bypassing i18n

Components that do not call `useI18n` but render visible text include:

- `src/components/Onboarding.tsx`
- `src/components/layout/NewVersionPopup.tsx`
- `src/components/layout/ErrorPage.tsx`
- `src/components/projects/ProjectHeader.tsx`
- `src/components/projects/ProjectWorkspace.tsx`
- `src/components/projects/RawConceptPanel.tsx`
- `src/components/projects/ScreenImageGallery.tsx`
- `src/components/projects/ProjectDashboard.tsx`
- `src/components/projects/ProjectOutputTabs.tsx`
- `src/components/buildFeed/VibeCoderDirectory.tsx`
- `src/components/buildFeed/DailySignal.tsx`
- `src/components/buildFeed/BuilderProfile.tsx`
- `src/components/buildFeed/StartHere.tsx`
- `src/components/buildFeed/CurrentFocus.tsx`
- `src/components/agents/AgentList.tsx`
- `src/components/agents/AgentEditor.tsx`
- `src/components/models/OpenRouterDiagnosticsPage.tsx`
- `src/components/pipeline/PipelineLogViewer.tsx`
- `src/components/pipeline/ImagePipelineProgressOverlay.tsx`
- `src/components/pipeline/PipelineProgressOverlay.tsx`
- `src/components/pipeline/PipelineStepList.tsx`
- `src/components/ui/SearchInput.tsx`, `ConfirmDialog.tsx`, `ActionButton.tsx`, `EmptyState.tsx`, `Toast.tsx`, `FilterBar.tsx`, `TabPanel.tsx`
- `src/components/help/HelpBlock.tsx`, `TooltipHelp.tsx`

Components that call `useI18n` but still contain significant hardcoded copy include:

- `src/App.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/LandingPage.tsx`
- `src/components/bootstrap/BootstrapPage.tsx`
- `src/components/guide/GuidePage.tsx`
- `src/components/buildFeed/LiveBuildFeed.tsx`
- `src/components/buildFeed/LiveBuildFeedAdmin.tsx`
- `src/components/vision/FounderVisionPage.tsx`
- `src/components/models/LLMSettingsPage.tsx`
- `src/components/projects/ProjectCard.tsx`
- `src/components/agents/AgentCard.tsx`

## Dynamic strings not localized

Dynamic strings that are assembled at runtime need translation templates rather than string concatenation or raw enum rendering:

- **Statuses and workflow labels:** Some statuses are mapped through localized status keys, but values such as `Draft`, `Active`, `Processing`, `Failed`, `Success`, `Ready for Review`, `Needs Changes`, `Accepted`, `Building`, `Testing` and `Achieved` still appear directly in several screens.
- **Dates and durations:** `formatDate`, `formatNumber` and `formatRelativeTime` exist, but some components manually format durations such as `m:ss` and display version/date labels directly.
- **Toasts and alerts:** Toast messages from `useToast()` calls and browser `alert()` calls frequently pass literal English strings.
- **Generated ticket content:** Founder input, AI-polished titles/context/requested changes, Daily Signals, vision body text, project names and agent instructions are user/generated content and should not be translated automatically. Surrounding labels/actions should be localized.
- **Interpolated messages:** Existing interpolation supports simple `{{token}}` replacement, but most dynamic messages do not yet use translation keys with placeholders.

## Persistence status

- **Local storage:** Anonymous and first-load preferences are stored under `blueprintforge.preferredLanguage`.
- **Browser language detection:** If local storage is empty, the provider uses the first part of `navigator.language` when supported; otherwise it falls back to English.
- **Profile persistence:** Authenticated users persist language through `POST /api/auth/preferred-language` and the `users.preferred_language` column.
- **Hydration behavior:** When an authenticated profile has a supported `preferred_language`, it overwrites local state and local storage.
- **Failure behavior:** Profile update failures are logged to the console. The local preference remains saved, but no visible recovery UI is currently shown from the provider.

## Language switch propagation

- The provider wraps the main app, so any component using `useI18n()` re-renders when `language` changes.
- `LanguageSelector` updates provider state immediately and saves the new preference.
- `document.documentElement.lang` updates on every language change.
- Components with hardcoded text do not change when the language changes.
- Components that compute translated arrays during render generally update correctly because `t` is memoized with `language`.
- Persisted profile language may override the local selection after auth/profile hydration. This is intentional, but the UX should make profile-backed preference precedence clear.

## RTL readiness

- **Current status:** Not RTL-ready.
- `document.documentElement.dir` is always set to `ltr`.
- No supported language in the current list requires RTL, but Hindi is not RTL and Japanese is not RTL; future Arabic/Hebrew/Persian/Urdu support would need direction metadata.
- Tailwind classes heavily use physical left/right utilities (`left-*`, `right-*`, `ml-*`, `mr-*`, `text-left`, `border-r`, `border-l`) rather than logical properties.
- Icons, timelines, sidebars, nav placement and floating action positions assume left-to-right layout.
- Recommendation: add `dir` to language metadata, set `document.documentElement.dir` from metadata, audit physical CSS utilities and add RTL visual regression checks before adding RTL locales.

## Build/runtime issues

- No third-party i18n dependency is installed, so there are no package-level build risks from i18next/react-intl upgrades.
- Static JSON imports are simple and Vite-friendly, but every locale is included in the main bundle.
- Missing keys do not fail builds; they return the raw key at runtime.
- The translation function only returns strings. If a key resolves to an object or array, the raw key is returned.
- Interpolation silently replaces missing tokens with an empty string, which can hide content issues.
- The provider writes `window.localStorage` in callbacks/effects without guarding every access. This is acceptable for the current client-rendered app but should be revisited if server rendering is introduced.
- The API endpoint accepts `preferred_language` with fallback to `en`; repository-level validation should continue to reject unsupported languages or normalize them before persistence.

## Namespace quality

- **Strengths:** The current `common.json` structure is readable, domain-grouped and consistent across all supported locales.
- **Weaknesses:** One namespace is already too broad. It mixes navigation, status values, landing, bootstrap, guide, build feed, profile, models and vision text.
- **Coverage gap:** The namespace contains an initial set of keys, but the application has far more hardcoded text than localized keys.
- **Naming consistency:** Existing keys use a clear lower camelCase / nested domain style. Future keys should continue that style.
- **Recommended split:** Keep `common` for global navigation/status/buttons/errors, then introduce feature namespaces such as `landing`, `bootstrap`, `guide`, `buildFeed`, `builderProfile`, `projects`, `agents`, `models`, `vision`, `pipeline` and `shared` when the custom loader supports it.
