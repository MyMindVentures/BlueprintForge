# BlueprintForge I18n Audit

## Audit scope and commands

This audit was refreshed after scanning the full frontend source tree under `src/` and the locale resources under `locales/`.

| Area | Files / paths scanned | Status | Notes |
| --- | --- | --- | --- |
| I18n core | `src/i18n/config.ts`, `src/i18n/I18nProvider.tsx`, `src/i18n/LanguageSelector.tsx` | ✅ Localized | Custom provider, runtime switching, locale formatting and selector are present. |
| Locale files | `locales/{en,nl,fr,de,es,pt,it,pl,tr,ja}/common.json` | ✅ Localized | Ten locale bundles now share 804 flattened keys. |
| App shell/layout | `src/App.tsx`, `src/components/layout/*` | ✅ Localized | New version popup, landing, error and shell copy route through i18n. |
| Bootstrap/founder flow | `src/components/bootstrap/*`, `src/components/vision/*` | ✅ Localized | Founder workflow labels, prompts, empty states and status text route through locale keys. |
| Build feed/builder flow | `src/components/buildFeed/*` | ✅ Localized | Feed, admin, builder profile, directory, daily signal, start/current focus text route through locale keys. |
| Guides/demo recorder | `src/components/guide/*`, `src/content/guides/*` | 🟡 Partial | Guide UI and version/demo controls are localized; stored guide markdown remains canonical content and safely falls back. |
| Projects/agents/models | `src/components/projects/*`, `src/components/agents/*`, `src/components/models/*` | ✅ Localized | Forms, tabs, settings, diagnostics, editor and card UI copy route through locale keys. |
| Shared UI/state/help/pipeline | `src/components/ui/*`, `src/components/state/*`, `src/components/help/*`, `src/components/pipeline/*`, `src/components/status/*` | 🟡 Partial | Scanned JSX/checked props are clean; dynamic caller-provided backend data remains intentionally untranslated unless mapped. |
| Hooks/services/API messages | `src/hooks/*`, `src/services/*`, `src/server/*` | 🟡 Partial | Frontend-visible UI literals were removed from TSX; raw server/developer errors should continue to be mapped before display. |

Audit commands used:

- `npm run i18n:check`
- `npx tsx scripts/check-hardcoded-ui-text.ts`
- `npm run lint`
- `npm run build`

## Existing i18n library used

- **Library:** custom React/Vite i18n implementation.
- **Not used:** i18next, next-intl and react-intl are not installed.
- **Runtime API:** `I18nProvider` exposes `language`, `locale`, `setLanguage`, `t`, date/number/relative-time formatters and a lightweight `tx()` helper for legacy migrated JSX text.
- **Fallback:** English (`en`) is the default language and fallback bundle.
- **Persistence:** preferred language is stored in `localStorage` and posted to `/api/auth/preferred-language` when a profile exists.
- **Interpolation/pluralization:** `{{token}}` interpolation and `Intl.PluralRules` suffix lookup are supported.

## Hardcoded text findings

| Finding group | Before | After | Status |
| --- | ---: | ---: | --- |
| Baseline JSX/propped UI literals detected by hardcoded-text scanner | 427 | 0 | ✅ Localized |
| Locale parity issues | 0 | 0 | ✅ Localized |
| Files with unscanned non-TSX data/content that can be user-authored | Present | Present | 🟡 Partial |
| Backend/developer error strings shown without mapping | Possible | Requires ongoing review | 🟡 Partial |

The cleanup migrated detected user-facing JSX text and checked props (`label`, `title`, `placeholder`, `aria-label`, `description`, `emptyMessage`, `error`, `success`) into locale resources and reset the hardcoded-text baseline to an empty list.

## Missing translation keys

- ✅ No missing keys across the ten configured locales after cleanup.
- ✅ The hardcoded-text check reports zero remaining TSX findings for scanned text categories.
- 🟡 Full human-quality translations for the newly migrated legacy UI keys should be reviewed by native speakers; the structure is present and fallback-safe.

## Components bypassing i18n

- ✅ Scanned TSX components no longer contain detected user-facing JSX/propped strings.
- 🟡 User-authored/project/generated content is not translated automatically. That includes saved guide markdown, build request titles, AI output, GitHub issue text, model names and database records.
- 🟡 Any future toast/error strings created outside TSX must use existing translation keys or a mapping utility before display.

## Dynamic strings not localized

| Dynamic source | Status | Rule |
| --- | --- | --- |
| Status badges | ✅ Localized | Known statuses should be translated through `statuses.*`; unknown persisted statuses are treated as data. |
| Dates/numbers/relative time | ✅ Localized | Use i18n formatter helpers. |
| API/backend error details | 🟡 Partial | Show localized generic messages and keep raw details in logs/dev-only surfaces. |
| AI/GitHub/OpenRouter returned names/content | 🟡 Partial | Treat as external/generated data unless the UI label around it is application copy. |
| Guide markdown body | 🟡 Partial | English canonical content may remain, but guide UI chrome and structure are localizable. |

## Language persistence and propagation

- ✅ Language selector updates the provider state at runtime.
- ✅ Selection persists in `localStorage` using `blueprintforge.preferredLanguage`.
- ✅ Authenticated profile persistence is supported through the preferred-language API.
- ✅ `document.documentElement.lang` updates on language changes.
- 🟡 `dir` is currently forced to `ltr` because all ten target languages are LTR.

## RTL readiness notes

- Current target languages do not require RTL.
- Before adding Arabic/Hebrew/Farsi/Urdu, add direction metadata to language config, replace directional CSS assumptions where needed, and test nav/sidebar/modal layouts with `dir="rtl"`.

## Build/runtime issues

- ✅ `npm run lint` passes.
- ✅ `npm run build` passes.
- ⚠️ Vite reports a large bundle warning; this is unrelated to i18n correctness and can be addressed with code-splitting/lazy locale loading later.

## Namespace structure quality

| Aspect | Status | Notes |
| --- | --- | --- |
| Domain nesting | ✅ Localized | Existing nested groups cover common app areas. |
| Physical namespaces | 🧠 Needs restructuring | All keys still live in `common.json`; future work should split into `auth`, `founder`, `builder`, `github`, `openrouter`, `guide`, etc. |
| Legacy migration keys | 🧠 Needs restructuring | `uiLegacy.*` preserves production safety after migration; keys should be renamed gradually into domain namespaces. |
| Lazy loading | 🧠 Needs restructuring | Locale bundles are statically imported today. |
