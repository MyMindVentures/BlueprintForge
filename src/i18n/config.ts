import enCommon from '../../locales/en/common.json';
import nlCommon from '../../locales/nl/common.json';
import frCommon from '../../locales/fr/common.json';
import deCommon from '../../locales/de/common.json';
import esCommon from '../../locales/es/common.json';
import ptCommon from '../../locales/pt/common.json';
import itCommon from '../../locales/it/common.json';
import plCommon from '../../locales/pl/common.json';
import hiCommon from '../../locales/hi/common.json';
import jaCommon from '../../locales/ja/common.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', locale: 'en-US' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', locale: 'nl-NL' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', locale: 'pt-PT' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', locale: 'it-IT' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', locale: 'pl-PL' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', locale: 'hi-IN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', locale: 'ja-JP' }
] as const;

export const I18N_NAMESPACES = [
  'common',
  'auth',
  'founder',
  'builder',
  'notifications',
  'github',
  'openrouter',
  'demo',
  'changelog',
  'guide',
  'errors',
  'states',
  'buttons',
  'forms'
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];
export type I18nNamespace = typeof I18N_NAMESPACES[number];
export type TranslationPrimitive = string | number | boolean | null | undefined;
export type TranslationOptions = Record<string, TranslationPrimitive> & {
  count?: number;
  ns?: I18nNamespace;
};
export type I18nResourceTree = Record<string, unknown>;
export type I18nResourceBundle = Record<I18nNamespace, I18nResourceTree>;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const DEFAULT_NAMESPACE: I18nNamespace = 'common';
export const LANGUAGE_STORAGE_KEY = 'blueprintforge.preferredLanguage';

const legacyResources: Record<LanguageCode, I18nResourceTree> = {
  en: enCommon,
  nl: nlCommon,
  fr: frCommon,
  de: deCommon,
  es: esCommon,
  pt: ptCommon,
  it: itCommon,
  pl: plCommon,
  hi: hiCommon,
  ja: jaCommon
};

const withCount = (singular: string, plural: string) => ({
  one: singular,
  other: plural
});

const countLabels = {
  stars: withCount('{{count}} star', '{{count}} stars'),
  tickets: withCount('{{count}} ticket', '{{count}} tickets'),
  requests: withCount('{{count}} request', '{{count}} requests'),
  builders: withCount('{{count}} builder', '{{count}} builders'),
  models: withCount('{{count}} model', '{{count}} models'),
  notifications: withCount('{{count}} notification', '{{count}} notifications'),
  changelogEntries: withCount('{{count}} changelog entry', '{{count}} changelog entries')
};

const expandPluralLabels = (labels: Record<string, { one: string; other: string }>) =>
  Object.fromEntries(
    Object.entries(labels).flatMap(([key, value]) => [
      [`${key}_one`, value.one],
      [`${key}_other`, value.other]
    ])
  );

const pick = (source: I18nResourceTree, key: string) => source[key] ?? {};

const buildResourceBundle = (common: I18nResourceTree): I18nResourceBundle => {
  const counts = expandPluralLabels(countLabels);

  return {
    common: {
      ...common,
      counts
    },
    auth: {
      language: pick(common, 'language'),
      navigation: {
        loggedInAs: (common.navigation as I18nResourceTree | undefined)?.loggedInAs,
        logout: (common.navigation as I18nResourceTree | undefined)?.logout,
        signIn: (common.navigation as I18nResourceTree | undefined)?.signIn,
        account: (common.navigation as I18nResourceTree | undefined)?.account
      },
      app: {
        loadingAuthTitle: (common.app as I18nResourceTree | undefined)?.loadingAuthTitle,
        loadingAuthDescription: (common.app as I18nResourceTree | undefined)?.loadingAuthDescription
      },
      errors: {
        accessDenied: (common.errors as I18nResourceTree | undefined)?.accessDenied,
        missingPermission: (common.errors as I18nResourceTree | undefined)?.missingPermission,
        founderAccessHint: (common.errors as I18nResourceTree | undefined)?.founderAccessHint,
        profilePersistenceFailed: (common.errors as I18nResourceTree | undefined)?.profilePersistenceFailed
      }
    },
    founder: {
      bootstrap: pick(common, 'bootstrap'),
      founderVision: (common.navigation as I18nResourceTree | undefined)?.founderVision,
      buildFeed: pick(common, 'buildFeed')
    },
    builder: {
      buildFeed: pick(common, 'buildFeed'),
      builderProfile: pick(common, 'builderProfile'),
      directory: pick(common, 'directory'),
      counts
    },
    notifications: {
      ...((pick(common, 'notifications') as I18nResourceTree) || {}),
      counts: {
        notifications_one: counts.notifications_one,
        notifications_other: counts.notifications_other
      }
    },
    github: pick(common, 'github') as I18nResourceTree,
    openrouter: {
      title: (common.navigation as I18nResourceTree | undefined)?.openRouterSettings,
      errors: {
        missingOpenRouterKey: (common.errors as I18nResourceTree | undefined)?.missingOpenRouterKey
      },
      counts: {
        models_one: counts.models_one,
        models_other: counts.models_other,
        requests_one: counts.requests_one,
        requests_other: counts.requests_other
      }
    },
    demo: pick(common, 'demo') as I18nResourceTree,
    changelog: {
      entries_one: counts.changelogEntries_one,
      entries_other: counts.changelogEntries_other
    },
    guide: pick(common, 'guide') as I18nResourceTree,
    errors: pick(common, 'errors') as I18nResourceTree,
    states: {
      app: pick(common, 'app'),
      statuses: pick(common, 'statuses'),
      success: pick(common, 'success')
    },
    buttons: pick(common, 'buttons') as I18nResourceTree,
    forms: {
      bootstrap: {
        placeholder: (common.bootstrap as I18nResourceTree | undefined)?.placeholder,
        specTitle: (common.bootstrap as I18nResourceTree | undefined)?.specTitle,
        context: (common.bootstrap as I18nResourceTree | undefined)?.context,
        requestedChange: (common.bootstrap as I18nResourceTree | undefined)?.requestedChange
      },
      buildFeed: {
        dailySignalPlaceholder: (common.buildFeed as I18nResourceTree | undefined)?.dailySignalPlaceholder,
        builderFocusPlaceholder: (common.buildFeed as I18nResourceTree | undefined)?.builderFocusPlaceholder
      },
      builderProfile: {
        availability: (common.builderProfile as I18nResourceTree | undefined)?.availability,
        preferredStack: (common.builderProfile as I18nResourceTree | undefined)?.preferredStack,
        portfolio: (common.builderProfile as I18nResourceTree | undefined)?.portfolio,
        github: (common.builderProfile as I18nResourceTree | undefined)?.github,
        bio: (common.builderProfile as I18nResourceTree | undefined)?.bio
      }
    }
  };
};

export const resources: Record<LanguageCode, I18nResourceBundle> = Object.fromEntries(
  Object.entries(legacyResources).map(([language, common]) => [language, buildResourceBundle(common)])
) as Record<LanguageCode, I18nResourceBundle>;

export const isSupportedLanguage = (value?: string | null): value is LanguageCode =>
  Boolean(value && SUPPORTED_LANGUAGES.some((language) => language.code === value));

export const isSupportedNamespace = (value?: string | null): value is I18nNamespace =>
  Boolean(value && I18N_NAMESPACES.includes(value as I18nNamespace));

export const languageToLocale = (language: LanguageCode) =>
  SUPPORTED_LANGUAGES.find((entry) => entry.code === language)?.locale || 'en-US';
