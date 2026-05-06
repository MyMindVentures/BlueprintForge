import enCommon from './locales/en/common.json';
import enButtons from './locales/en/buttons.json';
import enForms from './locales/en/forms.json';
import enErrors from './locales/en/errors.json';
import enStates from './locales/en/states.json';
import enGuide from './locales/en/guide.json';
import nlCommon from './locales/nl/common.json';
import nlButtons from './locales/nl/buttons.json';
import nlForms from './locales/nl/forms.json';
import nlErrors from './locales/nl/errors.json';
import nlStates from './locales/nl/states.json';
import nlGuide from './locales/nl/guide.json';
import frCommon from './locales/fr/common.json';
import frButtons from './locales/fr/buttons.json';
import frForms from './locales/fr/forms.json';
import frErrors from './locales/fr/errors.json';
import frStates from './locales/fr/states.json';
import frGuide from './locales/fr/guide.json';
import deCommon from './locales/de/common.json';
import deButtons from './locales/de/buttons.json';
import deForms from './locales/de/forms.json';
import deErrors from './locales/de/errors.json';
import deStates from './locales/de/states.json';
import deGuide from './locales/de/guide.json';
import esCommon from './locales/es/common.json';
import esButtons from './locales/es/buttons.json';
import esForms from './locales/es/forms.json';
import esErrors from './locales/es/errors.json';
import esStates from './locales/es/states.json';
import esGuide from './locales/es/guide.json';
import ptCommon from './locales/pt/common.json';
import ptButtons from './locales/pt/buttons.json';
import ptForms from './locales/pt/forms.json';
import ptErrors from './locales/pt/errors.json';
import ptStates from './locales/pt/states.json';
import ptGuide from './locales/pt/guide.json';
import itCommon from './locales/it/common.json';
import itButtons from './locales/it/buttons.json';
import itForms from './locales/it/forms.json';
import itErrors from './locales/it/errors.json';
import itStates from './locales/it/states.json';
import itGuide from './locales/it/guide.json';
import plCommon from './locales/pl/common.json';
import plButtons from './locales/pl/buttons.json';
import plForms from './locales/pl/forms.json';
import plErrors from './locales/pl/errors.json';
import plStates from './locales/pl/states.json';
import plGuide from './locales/pl/guide.json';
import hiCommon from './locales/hi/common.json';
import hiButtons from './locales/hi/buttons.json';
import hiForms from './locales/hi/forms.json';
import hiErrors from './locales/hi/errors.json';
import hiStates from './locales/hi/states.json';
import hiGuide from './locales/hi/guide.json';
import trCommon from './locales/tr/common.json';
import trButtons from './locales/tr/buttons.json';
import trForms from './locales/tr/forms.json';
import trErrors from './locales/tr/errors.json';
import trStates from './locales/tr/states.json';
import trGuide from './locales/tr/guide.json';
import jaCommon from './locales/ja/common.json';
import jaButtons from './locales/ja/buttons.json';
import jaForms from './locales/ja/forms.json';
import jaErrors from './locales/ja/errors.json';
import jaStates from './locales/ja/states.json';
import jaGuide from './locales/ja/guide.json';

const buildResource = (common: any, buttons: any, forms: any, errors: any, states: any, guide: any) => ({
  ...common,
  ...states,
  buttons,
  forms,
  errors,
  states,
  guide,
  bootstrap: {
    ...common.bootstrap,
    ...forms
  }
});

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
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', locale: 'tr-TR' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', locale: 'ja-JP' }
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];
export type TranslationOptions = Record<string, string | number | boolean | null | undefined>;
export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'blueprintforge.preferredLanguage';

export const resources: Record<LanguageCode, any> = {
  en: buildResource(enCommon, enButtons, enForms, enErrors, enStates, enGuide),
  nl: buildResource(nlCommon, nlButtons, nlForms, nlErrors, nlStates, nlGuide),
  fr: buildResource(frCommon, frButtons, frForms, frErrors, frStates, frGuide),
  de: buildResource(deCommon, deButtons, deForms, deErrors, deStates, deGuide),
  es: buildResource(esCommon, esButtons, esForms, esErrors, esStates, esGuide),
  pt: buildResource(ptCommon, ptButtons, ptForms, ptErrors, ptStates, ptGuide),
  it: buildResource(itCommon, itButtons, itForms, itErrors, itStates, itGuide),
  pl: buildResource(plCommon, plButtons, plForms, plErrors, plStates, plGuide),
  hi: buildResource(hiCommon, hiButtons, hiForms, hiErrors, hiStates, hiGuide),
  tr: buildResource(trCommon, trButtons, trForms, trErrors, trStates, trGuide),
  ja: buildResource(jaCommon, jaButtons, jaForms, jaErrors, jaStates, jaGuide)
};

export const isSupportedLanguage = (value?: string | null): value is LanguageCode =>
  Boolean(value && SUPPORTED_LANGUAGES.some((language) => language.code === value));

export const languageToLocale = (language: LanguageCode) =>
  SUPPORTED_LANGUAGES.find((entry) => entry.code === language)?.locale || 'en-US';
