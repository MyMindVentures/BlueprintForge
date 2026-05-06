# I18n Architecture

## Goal

BlueprintForge AI ships a multilingual interface. User-facing UI copy should live in the i18n resource layer and be rendered through the project translation helpers instead of being embedded directly in JSX.

## Hardcoded UI Text Rule

Frontend `.tsx` files must not introduce new hardcoded user-facing strings in visible JSX children or common UI copy props. Use `useI18n()` and `t("translation.key")` for display text, placeholders, accessibility labels, empty states, status messages, and validation copy.

The lightweight guardrail is available with:

```bash
npm run i18n:check
```

The check scans `src/**/*.tsx`, excluding tests and stories, for:

- Visible JSX text nodes.
- Literal string children inside JSX expressions.
- Literal values for common user-facing prop names: `label`, `title`, `placeholder`, `aria-label`, `description`, `emptyMessage`, `error`, and `success`.

## Allowlisted Values

The check intentionally allows values that are normally internal implementation details rather than translated product copy, including:

- Test and story files.
- Internal constants or expressions passed through props, such as `label={NAV_LABEL}`.
- Icon/component names used as non-sentence `title` values.
- Route IDs, slugs, storage keys, and enum-like values such as `feed_coder`, `primary`, or `admin.owner`.
- CSS classes and styling tokens, which are not scanned as UI copy props.

Existing pre-rule findings are captured in `scripts/check-hardcoded-ui-text.baseline.json` so the guardrail can block new hardcoded copy while the current UI is migrated incrementally. Do not add new entries to the baseline unless the team is intentionally checkpointing a larger i18n migration.

If a rare false positive is not user-facing, add `// i18n-check-ignore` on the same line or the line immediately above it and include enough surrounding code context to make the exception obvious during review.

## Authoring Pattern

Prefer this pattern for new UI copy:

```tsx
const { t } = useI18n();

return <SearchInput placeholder={t("projects.searchPlaceholder")} />;
```

Avoid this pattern for user-facing copy:

```tsx
return <SearchInput placeholder="Search projects" />;
```
