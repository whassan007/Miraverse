import React, { createContext, useContext, useState } from 'react';
import { RTL, type Lang } from '../../../../packages/content/schema';

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
  t: (k, fb) => fb ?? k,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const dir: 'ltr' | 'rtl' = RTL.includes(lang) ? 'rtl' : 'ltr';
  const t = (key: string, fallback?: string) => fallback ?? key;
  return React.createElement(
    I18nContext.Provider,
    { value: { lang, dir, setLang, t } },
    children
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
