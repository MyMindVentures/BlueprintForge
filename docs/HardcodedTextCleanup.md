# Hardcoded Text Cleanup

## Summary

The frontend hardcoded-text migration moved all scanner-detected user-facing TSX text into i18n resources for the ten supported languages. The prevention baseline is now empty, so new hardcoded JSX/propped UI text fails the check instead of being hidden by legacy debt.

## Files scanned

The scan covered all non-test `.tsx` files under `src/`, including:

- `src/App.tsx`
- `src/components/layout/*`
- `src/components/bootstrap/*`
- `src/components/buildFeed/*`
- `src/components/guide/*`
- `src/components/projects/*`
- `src/components/agents/*`
- `src/components/models/*`
- `src/components/vision/*`
- `src/components/pipeline/*`
- `src/components/state/*`
- `src/components/help/*`
- `src/components/ui/*`

The scanner checks visible JSX text and common user-facing props: `label`, `title`, `placeholder`, `aria-label`, `description`, `emptyMessage`, `error` and `success`.

## Files fixed

The migration updated these source areas:

- `src/App.tsx`
- `src/components/Onboarding.tsx`
- `src/components/agents/AgentCard.tsx`
- `src/components/agents/AgentEditor.tsx`
- `src/components/agents/AgentList.tsx`
- `src/components/bootstrap/BootstrapPage.tsx`
- `src/components/buildFeed/BuilderProfile.tsx`
- `src/components/buildFeed/CurrentFocus.tsx`
- `src/components/buildFeed/DailySignal.tsx`
- `src/components/buildFeed/LiveBuildFeed.tsx`
- `src/components/buildFeed/LiveBuildFeedAdmin.tsx`
- `src/components/buildFeed/StartHere.tsx`
- `src/components/buildFeed/VibeCoderDirectory.tsx`
- `src/components/guide/AutoDemoRecorder.tsx`
- `src/components/guide/GuidePage.tsx`
- `src/components/help/HelpBlock.tsx`
- `src/components/layout/ErrorPage.tsx`
- `src/components/layout/LandingPage.tsx`
- `src/components/layout/NewVersionPopup.tsx`
- `src/components/models/LLMSettingsPage.tsx`
- `src/components/models/OpenRouterDiagnosticsPage.tsx`
- `src/components/pipeline/ImagePipelineProgressOverlay.tsx`
- `src/components/pipeline/PipelineLogViewer.tsx`
- `src/components/pipeline/PipelineProgressOverlay.tsx`
- `src/components/pipeline/PipelineStepList.tsx`
- `src/components/projects/ProjectCard.tsx`
- `src/components/projects/ProjectDashboard.tsx`
- `src/components/projects/ProjectHeader.tsx`
- `src/components/projects/ProjectOutputTabs.tsx`
- `src/components/projects/RawConceptPanel.tsx`
- `src/components/projects/ScreenImageGallery.tsx`
- `src/components/state/ErrorState.tsx`
- `src/components/state/SuccessState.tsx`
- `src/components/vision/FounderVisionPage.tsx`
- `src/i18n/I18nProvider.tsx`
- `locales/{en,nl,fr,de,es,pt,it,pl,tr,ja}/common.json`
- `scripts/check-hardcoded-ui-text.baseline.json`

## Translation structure added

- Added `uiLegacy.*` keys for 427 migrated JSX/propped strings and `uiStrings.*` keys for 165 migrated render-time string values.
- Kept existing domain groups such as `buttons`, `statuses`, `errors`, `notifications`, `landing`, `bootstrap`, `guide`, `buildFeed`, `builderProfile`, `directory`, `github` and `demo`.
- Expanded every locale file consistently, including status/state keys, so parity checks pass for all ten languages.

## Remaining hardcoded/untranslated areas

- User-authored and generated content remains data, not application UI copy. Examples: build request titles, AI-generated tickets, GitHub issue bodies, stored guide markdown and model/provider names.
- Some newly migrated `uiLegacy.*` values should be reviewed and renamed into domain-specific namespaces over time.
- Native-speaker review is recommended for newly migrated non-English resources to improve translation quality and tone.
- Non-TSX runtime strings in hooks/services should continue to be reviewed when they are surfaced in toasts, alerts or error states.

## Technical debt

- Physical namespace splitting is still pending; all locale resources live in `common.json`.
- Locale bundles are statically imported rather than lazy-loaded.
- The custom i18n layer does not support rich React-node translations or full ICU syntax.
- RTL readiness is documented but not implemented because none of the ten current languages require RTL.

## Recommended future cleanup

1. Rename high-traffic `uiLegacy.*` keys into stable domain groups as screens are edited.
2. Add native-speaker QA for German long labels and Japanese compact layout behavior.
3. Add smoke tests that switch to German and Japanese and verify critical pages render without overflow.
4. Map backend error codes to `errors.*` keys before showing them to users.
5. Consider dynamic locale imports if bundle size remains high.
