import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { RTL, UI_LANGS, type Lang } from '../../../../packages/content/schema';
import en from './locales/en.json';
import fr from './locales/fr.json';
import arLB from './locales/ar-LB.json';
import arEG from './locales/ar-EG.json';
import arIQ from './locales/ar-IQ.json';
import ko from './locales/ko.json';

const dictionaries: Record<Lang, Record<string, string>> = {
  en, fr, 'ar-LB': arLB, 'ar-EG': arEG, 'ar-IQ': arIQ, ko,
};
const normalize = (value: string): Lang => UI_LANGS.includes(value as Lang) ? value as Lang : 'en';

export interface I18nContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Lang) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  dir: 'ltr',
  setLang: () => {},
  t: (key, fallback) => (en as Record<string, string>)[key] ?? fallback ?? key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, updateLang] = useState<Lang>('en');
  const dir = RTL.includes(lang) ? 'rtl' : 'ltr';
  const setLang = useCallback((next: Lang) => updateLang(normalize(next)), []);
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);
  const t = useCallback((key: string, fallback?: string) =>
    dictionaries[lang][key] ?? dictionaries.en[key] ?? fallback ?? key, [lang]);
  const value = useMemo<I18nContextValue>(() => ({ lang, dir, setLang, t }), [lang, dir, setLang, t]);
  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  return useContext(I18nContext);
}
