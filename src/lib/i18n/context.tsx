'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import translations from './translations';
import { defaultLanguage, languages } from './languages';

interface I18nContextValue {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'arova-lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(defaultLanguage);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && languages.some(l => l.code === stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback((key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry[defaultLanguage] || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t } = useI18n();
  return t;
}
