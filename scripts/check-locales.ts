import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES = ['en', 'nl', 'fr', 'de', 'es', 'pt', 'it', 'pl', 'tr', 'ja'] as const;
const BASE_LOCALE = 'en';
const REPORT_IDENTICAL = process.argv.includes('--report-identical');
const ALLOWED_IDENTICAL_KEYS = new Set([
  'landing.eyebrow',
  'navigation.bootstrap',
  'navigation.aiAgents',
  'navigation.openRouterSettings',
  'buttons.enterBlueprintForge',
  'buttons.openGithubRepo',
  'builderProfile.github'
]);

type LocaleValue = string | LocaleTree;
interface LocaleTree {
  [key: string]: LocaleValue;
}

const flatten = (value: LocaleTree, prefix = ''): Record<string, string> =>
  Object.entries(value).reduce<Record<string, string>>((acc, [key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof nested === 'string') {
      acc[path] = nested;
      return acc;
    }

    Object.assign(acc, flatten(nested, path));
    return acc;
  }, {});

const readLocale = (locale: string) =>
  JSON.parse(readFileSync(join(process.cwd(), 'locales', locale, 'common.json'), 'utf8')) as LocaleTree;

const base = flatten(readLocale(BASE_LOCALE));
const baseKeys = Object.keys(base).sort();
let hasError = false;

for (const locale of LOCALES) {
  const values = flatten(readLocale(locale));
  const localeKeys = Object.keys(values).sort();
  const missing = baseKeys.filter((key) => !localeKeys.includes(key));
  const extra = localeKeys.filter((key) => !baseKeys.includes(key));

  if (missing.length || extra.length) {
    hasError = true;
    console.error(`\n${locale}: key mismatch`);
    if (missing.length) console.error(`  Missing: ${missing.join(', ')}`);
    if (extra.length) console.error(`  Extra: ${extra.join(', ')}`);
  }

  if (REPORT_IDENTICAL && locale !== BASE_LOCALE) {
    const identical = baseKeys.filter((key) => values[key] === base[key] && !ALLOWED_IDENTICAL_KEYS.has(key));
    if (identical.length) {
      console.warn(`\n${locale}: values identical to English (${identical.length})`);
      for (const key of identical) console.warn(`  ${key}: ${values[key]}`);
    }
  }
}

if (hasError) process.exit(1);
console.log(`Locale keys are complete for ${LOCALES.length} locales (${baseKeys.length} flattened keys).`);
