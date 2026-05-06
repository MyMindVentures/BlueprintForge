import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/apiClient';
import { UserContext } from '../types/buildFeed';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAMESPACE,
  I18nNamespace,
  LANGUAGE_STORAGE_KEY,
  LanguageCode,
  TranslationOptions,
  isSupportedLanguage,
  isSupportedNamespace,
  languageToLocale,
  resources
} from './config';
import { useAuth } from '../hooks/useAuth';

type I18nContextValue = {
  language: LanguageCode;
  locale: string;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: string, options?: TranslationOptions) => string;
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatRelativeTime: (value: string | number | Date) => string;
};

type ParsedTranslationKey = {
  namespace: I18nNamespace;
  path: string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const getByPath = (source: unknown, key: string) => key.split('.').reduce<unknown>((current, part) => {
  if (!current || typeof current !== 'object') return undefined;
  return (current as Record<string, unknown>)[part];
}, source);
const interpolate = (value: string, options?: TranslationOptions) => value.replace(/{{\s*(\w+)\s*}}/g, (_, token) => String(options?.[token] ?? ''));
const readStoredLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(stored)) return stored;
  const browserLanguage = window.navigator.language?.split('-')[0];
  return isSupportedLanguage(browserLanguage) ? browserLanguage : DEFAULT_LANGUAGE;
};

const parseTranslationKey = (key: string, namespace?: I18nNamespace): ParsedTranslationKey => {
  const separatorIndex = key.indexOf(':');
  if (separatorIndex > 0) {
    const namespaceCandidate = key.slice(0, separatorIndex);
    if (isSupportedNamespace(namespaceCandidate)) {
      return {
        namespace: namespaceCandidate,
        path: key.slice(separatorIndex + 1)
      };
    }
  }

  return {
    namespace: namespace || DEFAULT_NAMESPACE,
    path: key
  };
};

const getPluralSuffix = (language: LanguageCode, count?: number) => {
  if (typeof count !== 'number') return null;
  try {
    return new Intl.PluralRules(language).select(count);
  } catch {
    return count === 1 ? 'one' : 'other';
  }
};

const resolveTranslation = (language: LanguageCode, key: string, options?: TranslationOptions) => {
  const { namespace, path } = parseTranslationKey(key, options?.ns);
  const pluralSuffix = getPluralSuffix(language, options?.count);
  const paths = pluralSuffix ? [`${path}_${pluralSuffix}`, `${path}_other`, path] : [path];

  for (const candidatePath of paths) {
    const translated = getByPath(resources[language]?.[namespace], candidatePath);
    if (typeof translated === 'string') return translated;
  }

  if (language !== DEFAULT_LANGUAGE) {
    const fallbackSuffix = getPluralSuffix(DEFAULT_LANGUAGE, options?.count);
    const fallbackPaths = fallbackSuffix ? [`${path}_${fallbackSuffix}`, `${path}_other`, path] : [path];
    for (const candidatePath of fallbackPaths) {
      const translated = getByPath(resources[DEFAULT_LANGUAGE]?.[namespace], candidatePath);
      if (typeof translated === 'string') return translated;
    }
  }

  return null;
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>(readStoredLanguage);

  useEffect(() => {
    if (isSupportedLanguage(profile?.preferred_language) && profile.preferred_language !== language) {
      setLanguageState(profile.preferred_language);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, profile.preferred_language);
    }
  }, [language, profile?.preferred_language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);

  const t = useCallback((key: string, options?: TranslationOptions) => {
    const translated = resolveTranslation(language, key, options);
    return translated ? interpolate(translated, options) : key;
  }, [language]);

  const setLanguage = useCallback(async (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    if (profile) {
      try {
        await apiRequest<UserContext>('/api/auth/preferred-language', {
          method: 'POST',
          user: profile,
          body: JSON.stringify({ preferred_language: nextLanguage })
        });
      } catch (error) {
        console.error('Preferred language profile update failed:', error);
      }
    }
  }, [profile]);

  const locale = languageToLocale(language);
  const formatDate = useCallback((value: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options || { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)), [locale]);
  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, options).format(value), [locale]);
  const formatRelativeTime = useCallback((value: string | number | Date) => {
    const deltaSeconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
    const absolute = Math.abs(deltaSeconds);
    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [['day', 86400], ['hour', 3600], ['minute', 60]];
    const [unit, seconds] = units.find(([, seconds]) => absolute >= seconds) || ['second', 1];
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(deltaSeconds / seconds), unit);
  }, [locale]);

  const value = useMemo(() => ({ language, locale, setLanguage, t, formatDate, formatNumber, formatRelativeTime }), [language, locale, setLanguage, t, formatDate, formatNumber, formatRelativeTime]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
