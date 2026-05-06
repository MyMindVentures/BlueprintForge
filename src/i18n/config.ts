import en from '../../locales/en/common.json';
import nl from '../../locales/nl/common.json';
import fr from '../../locales/fr/common.json';
import de from '../../locales/de/common.json';
import es from '../../locales/es/common.json';
import pt from '../../locales/pt/common.json';
import it from '../../locales/it/common.json';
import pl from '../../locales/pl/common.json';
import tr from '../../locales/tr/common.json';
import ja from '../../locales/ja/common.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', locale: 'en-US' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', locale: 'nl-NL' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', locale: 'pt-PT' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', locale: 'it-IT' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', locale: 'pl-PL' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', locale: 'tr-TR' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', locale: 'ja-JP' }
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];
export type TranslationOptions = Record<string, string | number | boolean | null | undefined>;
export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'blueprintforge.preferredLanguage';

export const resources: Record<LanguageCode, any> = { en, nl, fr, de, es, pt, it, pl, tr, ja };

export const isSupportedLanguage = (value?: string | null): value is LanguageCode =>
  Boolean(value && SUPPORTED_LANGUAGES.some((language) => language.code === value));

export const languageToLocale = (language: LanguageCode) =>
  SUPPORTED_LANGUAGES.find((entry) => entry.code === language)?.locale || 'en-US';
