# BlueprintForge I18n Architecture

## Goals

The internationalization architecture should make every stable user-facing string translatable, keep generated/user-authored content intact, persist language preferences across anonymous and authenticated sessions, and provide a clear path to add locales without creating hardcoded English regressions.

## Chosen i18n library

BlueprintForge currently uses a **custom React context i18n layer** rather than a third-party library.

| Concern | Current choice |
| --- | --- |
| Provider | `I18nProvider` in `src/i18n/I18nProvider.tsx` |
| Hook | `useI18n()` |
| Translation function | `t(key, options?)` |
| Locale resources | Static JSON imports from `locales/<language>/common.json` |
| Language selector | `LanguageSelector` in `src/i18n/LanguageSelector.tsx` |
| Formatting | `Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.RelativeTimeFormat` through provider helpers |
| Persistence | Local storage plus authenticated PostgreSQL profile preference |

The current implementation is small and appropriate for an MVP. If translation complexity grows, evaluate `i18next` or `react-intl` for pluralization, namespaces, extraction tooling, rich text and missing-key diagnostics.

## Locale and namespace structure

### Current structure

```text
locales/
  en/common.json
  nl/common.json
  fr/common.json
  de/common.json
  es/common.json
  pt/common.json
  it/common.json
  pl/common.json
  hi/common.json
  ja/common.json
```

Each `common.json` file currently uses nested domains similar to:

```text
language.*
navigation.*
buttons.*
statuses.*
app.*
notifications.*
errors.*
success.*
landing.*
bootstrap.*
guide.*
buildFeed.*
profile.*
models.*
vision.*
```

### Required near-term structure

Until true multi-namespace loading exists, continue adding keys to `common.json` with domain prefixes:

- `shared.*` for common reusable UI labels.
- `forms.*` for generic validation and field actions.
- `projects.*` for project dashboard/workspace/gallery/output copy.
- `agents.*` for agent list/card/editor copy.
- `buildFeed.*` for live feed and ticket lifecycle copy.
- `buildFeedAdmin.*` for founder command center copy.
- `builderProfile.*` and `builderDirectory.*` for builder profile/network copy.
- `pipeline.*` for generation/progress overlays.
- `diagnostics.*` or `models.diagnostics.*` for OpenRouter diagnostics.

### Future namespace structure

When dynamic namespace loading is added, split files like this:

```text
locales/en/common.json
locales/en/landing.json
locales/en/bootstrap.json
locales/en/guide.json
locales/en/buildFeed.json
locales/en/projects.json
locales/en/agents.json
locales/en/models.json
locales/en/vision.json
locales/en/pipeline.json
```

Keep keys stable during the split by moving `projects.*` from `common.json` to `projects.json` rather than renaming all leaves at once.

## Fallback logic

Current fallback order:

1. Requested active language resource by dot-path key.
2. English resource by the same dot-path key.
3. Raw key string when neither resource contains a string.

Startup language resolution:

1. `localStorage` value at `blueprintforge.preferredLanguage`, when supported.
2. Browser language prefix from `navigator.language`, when supported.
3. Default language `en`.
4. Authenticated profile `preferred_language` overrides the local value after profile hydration when supported.

Rules for future changes:

- English remains the canonical fallback locale.
- Unsupported language codes must never be persisted.
- Missing translation keys should be logged in development and optionally fail CI once extraction tooling exists.
- Never use a fallback to hide missing source keys during cleanup work; add the key to English first, then copy to all locales.

## Persistence strategy

### Anonymous users

- Store the selected language in `window.localStorage` using `blueprintforge.preferredLanguage`.
- Use browser language only on first load when no stored preference exists.
- Keep local storage writes immediate so language changes survive refreshes.

### Authenticated users

- Save selected language through `POST /api/auth/preferred-language`.
- Persist the value in `users.preferred_language`.
- On profile load, hydrate the provider from `profile.preferred_language` and sync local storage.
- If profile persistence fails, keep local storage as the source of truth for the current browser session and show a visible toast in the caller or selector layer.

### Validation

- Validate language values against `SUPPORTED_LANGUAGES` before writing local storage or PostgreSQL.
- Reject or normalize unsupported API values to `en`.
- Prefer a shared validator so frontend and server cannot drift.

## Dynamic translation rules

Use translation templates for any runtime message that mixes text with variables.

### Preferred pattern

```tsx
t('buildFeed.ticketCount', { count: visibleRequests.length })
t('projects.updatedAt', { date: formatDate(project.updatedAt) })
t('pipeline.stepProgress', { completed, total })
```

### Avoid

```tsx
`${visibleRequests.length} tickets found`
'Updated ' + formatDate(project.updatedAt)
status === 'Failed' ? 'Failed' : 'Processing'
```

### User/generated content

Do **not** translate these automatically:

- Founder raw input.
- AI-polished ticket title, context and requested change.
- Daily Signal body text.
- Builder names, bios, countries and skills.
- Project names, raw concepts, generated specs and generated markdown.
- Agent names, descriptions and base instructions.
- Vision entries authored by the founder.

Translate only the surrounding chrome: labels, buttons, helper text, empty states, validation messages and action feedback.

### Enums/statuses

- Map enums to translation keys in a shared helper rather than rendering raw enum values.
- Use a stable key-safe transform only when the enum domain is controlled, for example `statuses.readyForReview`.
- Keep stored enum values in English/technical form; translate only at render time.

### Dates, numbers and relative time

- Use `formatDate`, `formatNumber` and `formatRelativeTime` from `useI18n()`.
- Do not manually format display dates outside utility helpers unless the format is intentionally locale-independent.
- Durations such as recording timers may remain numeric (`mm:ss`), but surrounding labels should be translated.

## Adding new translations

1. Add the English source string under the appropriate domain in `locales/en/common.json`.
2. Add the same key path to every other `locales/<lang>/common.json` file.
3. Use the key with `const { t } = useI18n()` in the component.
4. For dynamic values, add placeholders such as `{{count}}`, `{{name}}` or `{{status}}`.
5. Use provider formatting helpers for dates/numbers before passing formatted values into `t`.
6. Run a locale parity check to confirm each locale has the same flattened key set.
7. Manually switch through all supported languages for the affected screen.
8. If a string is intentionally not translated because it is generated/user-authored content, leave a short code comment only when the reason may be unclear.

## Avoiding future hardcoded text

Use this checklist before merging UI changes:

- [ ] No stable user-facing English text is embedded directly in JSX.
- [ ] Button labels, placeholders, titles, aria labels, empty states and validation messages use `t()`.
- [ ] Toasts, alerts and error banners use translation keys.
- [ ] Status/enum rendering goes through a translation helper.
- [ ] Dates, numbers and relative times use provider formatting helpers.
- [ ] New keys exist in every locale file.
- [ ] Long content blocks are stored in locale files unless they are explicitly authored content.
- [ ] Shared components expose translation-key props or receive already-localized labels.
- [ ] Tests prefer role/label assertions that use the expected translation key output for the default locale.

## Migration plan

1. **Stabilize shared helpers:** Add status/priority/difficulty translation helpers and use them consistently.
2. **Localize shared UI:** Convert `SearchInput`, `ConfirmDialog`, `ActionButton`, state components and pipeline overlays first to reduce repeated leaks.
3. **Localize public entry points:** Finish `LandingPage`, `BootstrapPage`, `GuidePage`, `LiveBuildFeed` and `StartHere`.
4. **Localize core workflows:** Convert project, agent, builder profile, admin feed, vision and model settings screens.
5. **Add diagnostics:** Log missing keys in development and add a locale parity script to CI.
6. **Plan namespace split:** Once key count grows substantially, move from one `common.json` file to feature namespaces.
7. **Prepare RTL:** Add direction metadata before adding any RTL locale.
