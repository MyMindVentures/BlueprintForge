# BlueprintForge Hardcoded Text Cleanup

## Scope

This document records the current hardcoded text cleanup state for the i18n workstream. It focuses on source files that can render user-facing text, not generated/user-authored content stored in the database.

## Files scanned

| Category | Files scanned | Result |
| --- | --- | --- |
| I18n core | `src/i18n/config.ts`, `src/i18n/I18nProvider.tsx`, `src/i18n/LanguageSelector.tsx` | I18n primitives exist and selector labels are localized. |
| Locale resources | `locales/en/common.json`, `locales/nl/common.json`, `locales/fr/common.json`, `locales/de/common.json`, `locales/es/common.json`, `locales/pt/common.json`, `locales/it/common.json`, `locales/pl/common.json`, `locales/hi/common.json`, `locales/ja/common.json` | Locale key parity is currently complete across all ten `common.json` files. |
| App and layout | `src/App.tsx`, `src/components/layout/AppShell.tsx`, `src/components/layout/LandingPage.tsx`, `src/components/layout/NewVersionPopup.tsx`, `src/components/layout/ErrorPage.tsx` | Partially localized; large layout/landing/version/error copy remains hardcoded. |
| Bootstrap and guide | `src/components/bootstrap/BootstrapPage.tsx`, `src/components/guide/GuidePage.tsx`, `src/components/guide/AutoDemoRecorder.tsx` | Partially localized; long-form content and many action labels remain hardcoded. |
| Build feed | `src/components/buildFeed/LiveBuildFeed.tsx`, `LiveBuildFeedAdmin.tsx`, `BuilderProfile.tsx`, `VibeCoderDirectory.tsx`, `DailySignal.tsx`, `StartHere.tsx`, `CurrentFocus.tsx` | Partially localized; this is one of the largest remaining hardcoded areas. |
| Projects | `src/components/projects/ProjectDashboard.tsx`, `ProjectWorkspace.tsx`, `ProjectHeader.tsx`, `ProjectCard.tsx`, `ProjectOutputTabs.tsx`, `RawConceptPanel.tsx`, `ScreenImageGallery.tsx` | Mostly hardcoded with some status formatting support. |
| Agents | `src/components/agents/AgentList.tsx`, `AgentCard.tsx`, `AgentEditor.tsx` | Mostly hardcoded. |
| Models and diagnostics | `src/components/models/LLMSettingsPage.tsx`, `OpenRouterDiagnosticsPage.tsx` | Mostly hardcoded. |
| Vision | `src/components/vision/FounderVisionPage.tsx` | Partially localized import exists, but most visible copy/status labels remain hardcoded. |
| Pipeline | `src/components/pipeline/PipelineLogViewer.tsx`, `PipelineStepList.tsx`, `PipelineProgressOverlay.tsx`, `ImagePipelineProgressOverlay.tsx` | Mostly hardcoded progress/status labels. |
| Shared UI/state/help | `src/components/ui/*`, `src/components/state/*`, `src/components/status/*`, `src/components/help/*`, `src/components/markdown/*` | Shared defaults and helper headings need i18n-safe APIs. |
| Onboarding/cards | `src/components/Onboarding.tsx`, `src/components/cards/NestedCardTree.tsx` | Onboarding text is hardcoded; card tree labels are mostly data/technical labels. |

## Files fixed

No source files were changed as part of this documentation-only cleanup record. Existing partial i18n coverage was already present in these files before this document was created:

- `src/i18n/config.ts`
- `src/i18n/I18nProvider.tsx`
- `src/i18n/LanguageSelector.tsx`
- `src/App.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/LandingPage.tsx`
- `src/components/bootstrap/BootstrapPage.tsx`
- `src/components/guide/GuidePage.tsx`
- `src/components/buildFeed/LiveBuildFeed.tsx`
- `src/components/buildFeed/LiveBuildFeedAdmin.tsx`
- `src/components/projects/ProjectCard.tsx`
- `src/components/agents/AgentCard.tsx`
- `src/components/models/LLMSettingsPage.tsx`
- `src/components/vision/FounderVisionPage.tsx`
- `src/components/ui/StatusBadge.tsx`

## Remaining hardcoded areas

### Public and onboarding surfaces

- Landing mission statement and narrative sections.
- Bootstrap hero/body/workflow content and CTA labels.
- Guide headings, release notes, anatomy sections and demo recorder controls.
- Onboarding modal title, description and action buttons.

### Builder workflow

- Live Build Feed title, subtitles, filters, stats and ticket lifecycle labels.
- Current Focus card labels and claim CTA.
- Start Here onboarding content.
- Builder profile form labels, helper text, status choices and validation messages.
- Vibe Coder Directory headings, cards, verification actions and empty states.
- Daily Signal publisher/waiting states.

### Founder/admin workflow

- Founder Command Center headings and helper text.
- Raw Founder Input / polish / publish flow labels.
- Build request management controls.
- Daily Signal admin publishing UI.
- Vision board form labels, empty states and status labels.

### Project and agent workflow

- Project dashboard, workspace tabs, raw concept form, image gallery and output actions.
- Pipeline progress overlays, log viewer and status messages.
- Agent list/card/editor labels and status controls.

### Technical settings

- OpenRouter settings page headings, diagnostics labels, console output headings and remediation messages.
- Error, loading and success states that are supplied as default props or literal strings by callers.

### Shared components

- `SearchInput` default placeholder.
- `ActionButton` default state labels.
- `ConfirmDialog` action labels when callers omit custom labels.
- `HelpBlock` heading.
- Toast and alert message call sites.

## Technical debt

- **Single namespace overload:** All translations live in `common.json`, which will become hard to review as cleanup proceeds.
- **No extraction tooling:** There is no automated detector for new hardcoded JSX text or missing keys.
- **No CI parity check:** Locale key parity was checked manually for this audit but is not enforced in CI.
- **No pluralization support:** `t()` only interpolates strings and cannot choose plural forms.
- **No rich text translation support:** Long content blocks with inline emphasis are difficult to represent cleanly.
- **No development missing-key warning:** Missing keys return the raw key silently.
- **Mixed enum rendering:** Some statuses use translation keys; others render stored enum labels directly.
- **Partial propagation:** Language changes only affect components wired to `useI18n`; hardcoded components remain static.
- **RTL not supported:** Direction is forced to `ltr` and layout classes assume left/right placement.
- **Persistence UX gap:** Profile save failures are logged but not consistently surfaced to users.

## Future cleanup recommendations

1. Add a script that flattens every locale file and fails when any locale differs from English.
2. Add a hardcoded text lint/check for JSX text nodes, common string props (`placeholder`, `title`, `aria-label`) and toast/alert call sites.
3. Convert shared components first so default labels cannot leak English text.
4. Create shared translation helpers for status, priority, difficulty, pipeline step state and GitHub sync state.
5. Finish public entry points next: landing, bootstrap, guide, live feed and onboarding.
6. Convert workflow-heavy screens in batches: build feed/admin, builder profile/directory, projects, agents, models and vision.
7. Keep generated/user-authored content untranslated and localize only surrounding labels.
8. Add development missing-key logging and a test that renders critical screens in at least one non-English language.
9. Split `common.json` into feature namespaces once the custom loader supports namespace loading.
10. Add language metadata for text direction and run an RTL layout audit before adding RTL languages.
