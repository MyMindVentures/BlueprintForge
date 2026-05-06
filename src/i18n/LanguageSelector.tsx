import React from 'react';
import { SUPPORTED_LANGUAGES } from './config';
import { useI18n } from './I18nProvider';

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  return (
    <label className="flex min-w-0 items-center gap-2 text-[10px] font-black text-text-dim" title={t('language.selector')}>
      <span className="sr-only">{t('language.selector')}</span>
      <select
        value={language}
        onChange={(event) => void setLanguage(event.target.value as any)}
        className="min-w-0 max-w-[9rem] rounded-xl border border-white/10 bg-[#111] px-2 py-2 text-[10px] font-black text-white outline-none transition-colors hover:border-accent/50 focus:border-accent md:max-w-[8.5rem]"
        aria-label={t('language.selector')}
      >
        {SUPPORTED_LANGUAGES.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {compact ? `${entry.flag} ${entry.code}` : `${entry.flag} ${entry.nativeName} (${entry.code})`}
          </option>
        ))}
      </select>
    </label>
  );
}
