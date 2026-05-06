# BlueprintForge I18n Architecture

## Overview

BlueprintForge uses a custom React/Vite i18n layer instead of a third-party package. The implementation is intentionally small and production-safe for the current app while leaving room to migrate to `react-i18next` later if namespace lazy-loading, extraction and ICU-rich messages become necessary.

## Supported languages

| Code | Language |
| --- | --- |
| `en` | English |
| `nl` | Dutch |
| `fr` | French |
| `de` | German |
| `es` | Spanish |
| `pt` | Portuguese |
| `it` | Italian |
| `pl` | Polish |
| `tr` | Turkish |
| `ja` | Japanese |

English is the default and fallback language.

## Files

- `src/i18n/config.ts` defines supported languages, namespace names, fallback constants and statically imported locale resources.
- `src/i18n/I18nProvider.tsx` provides runtime language state, translation lookup, interpolation, plural fallback, locale formatting and persistence.
- `src/i18n/LanguageSelector.tsx` renders the global accessible language selector.
- `locales/<language>/common.json` stores translation resources for each supported language.
- `scripts/check-locales.ts` verifies key parity across locales.
- `scripts/check-hardcoded-ui-text.ts` prevents new visible JSX/propped UI strings from bypassing i18n.

## Runtime behavior

1. The provider reads the initial language from `localStorage` or the browser language.
2. If the logged-in profile has `preferred_language`, it synchronizes the provider and local storage.
3. `setLanguage()` updates React state immediately, persists to `localStorage`, and attempts to save the profile preference.
4. `document.documentElement.lang` is updated on every language change.
5. Translations resolve from the selected language first, then from English, then to the raw key as a safe final fallback.

## Translation APIs

Use `useI18n()` in React components when possible:

```tsx
const { t, formatDate, formatNumber } = useI18n();
return <button>{t('buttons.save')}</button>;
```

Use `tx()` only for legacy migrated JSX or very small leaf components where adding a hook would be noisy. It reads the active language maintained by the provider and is safe for render-time UI labels.

```tsx
import { tx } from '../i18n/I18nProvider';

return <span>{tx('uiLegacy.components.example.001')}</span>;
```

## Interpolation and pluralization

Interpolation uses `{{token}}` replacement:

```json
{
  "welcome": "Welcome, {{name}}"
}
```

Pluralization uses suffixes selected by `Intl.PluralRules`:

```json
{
  "ticketCount_one": "{{count}} ticket",
  "ticketCount_other": "{{count}} tickets"
}
```

Call with:

```ts
t('stats.ticketCount', { count: tickets.length })
```

## Namespace structure

The configured logical namespaces are:

- `common`
- `auth`
- `founder`
- `builder`
- `notifications`
- `github`
- `openrouter`
- `demo`
- `changelog`
- `guide`
- `errors`
- `states`
- `buttons`
- `forms`

Currently all physical resources are stored in `common.json` for compatibility. Existing domain keys should stay readable (`buttons.save`, `statuses.open`, `guide.*`). The `uiLegacy.*` subtree contains strings migrated from hardcoded JSX and should be gradually renamed into stable domain namespaces during feature work.

## Adding new translations

1. Add an English key in `locales/en/common.json` under the most specific domain group.
2. Add the same key to all other locale files.
3. Use `t('domain.key')` or `tx('domain.key')` in UI code.
4. Run `npm run i18n:check`.
5. Run `npx tsx scripts/check-hardcoded-ui-text.ts` when editing TSX UI.
6. Do not add findings to the hardcoded baseline unless a documented non-user-facing exception exists.

## Hardcoding prevention rule

No new user-facing hardcoded text is allowed in components/pages. UI labels, placeholders, tooltips, aria labels, notifications, errors, statuses, guide chrome, modal text, empty/loading/success states and form validation copy must use i18n keys.

## Fallback logic and limitations

- Missing selected-language keys fall back to English.
- Missing English keys return the raw key, making the issue visible in UI and tests.
- User-authored/generated content is not automatically translated.
- The app is LTR-only today because all supported languages are LTR.
- Locale resources are statically imported. If bundle size becomes a concern, move each locale to a dynamic import and load on demand.
