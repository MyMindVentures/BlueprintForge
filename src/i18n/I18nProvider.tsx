import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/apiClient';
import { UserContext } from '../types/buildFeed';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, LanguageCode, TranslationOptions, isSupportedLanguage, languageToLocale, resources } from './config';
import { useAuth } from '../hooks/useAuth';

type I18nContextValue = {
  language: LanguageCode;
  locale: string;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: string, options?: TranslationOptions) => string;
  tData: <T,>(key: string) => T;
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatRelativeTime: (value: string | number | Date) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const getByPath = (source: any, key: string) => key.split('.').reduce((current, part) => current?.[part], source);
const interpolate = (value: string, options?: TranslationOptions) => value.replace(/{{\s*(\w+)\s*}}/g, (_, token) => String(options?.[token] ?? ''));
const readStoredLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(stored)) return stored;
  const browserLanguage = window.navigator.language?.split('-')[0];
  return isSupportedLanguage(browserLanguage) ? browserLanguage : DEFAULT_LANGUAGE;
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>(readStoredLanguage);

  useEffect(() => {
    if (isSupportedLanguage(profile?.preferred_language) && profile.preferred_language !== language) {
      setLanguageState(profile.preferred_language);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, profile.preferred_language);
    }
  }, [profile?.preferred_language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);

  const t = useCallback((key: string, options?: TranslationOptions) => {
    const translated = getByPath(resources[language], key) ?? getByPath(resources[DEFAULT_LANGUAGE], key);
    if (typeof translated === 'string') return interpolate(translated, options);
    return key;
  }, [language]);

  const tData = useCallback(<T,>(key: string): T => {
    const translated = getByPath(resources[language], key) ?? getByPath(resources[DEFAULT_LANGUAGE], key);
    return translated as T;
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

  const value = useMemo(() => ({ language, locale, setLanguage, t, tData, formatDate, formatNumber, formatRelativeTime }), [language, locale, setLanguage, t, tData, formatDate, formatNumber, formatRelativeTime]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
