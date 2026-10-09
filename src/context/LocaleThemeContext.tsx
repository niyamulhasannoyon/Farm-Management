'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, DICTIONARY, formatNumber, formatDate } from '@/lib/i18n';

interface LocaleThemeContextType {
  theme: 'light' | 'dark';
  locale: Locale;
  toggleTheme: () => void;
  toggleLocale: () => void;
  t: (key: keyof typeof DICTIONARY.en) => string;
  num: (val: number | string | null | undefined, decimals?: number) => string;
  date: (val: string | Date | null | undefined) => string;
}

const LocaleThemeContext = createContext<LocaleThemeContextType | undefined>(undefined);

export function LocaleThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('rbcl_theme') as 'light' | 'dark' | null;
    const savedLocale = localStorage.getItem('rbcl_locale') as Locale | null;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Default to dark theme for modern breeder dashboard
      document.documentElement.classList.add('dark');
    }

    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('rbcl_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'bn' : 'en';
    setLocale(nextLocale);
    localStorage.setItem('rbcl_locale', nextLocale);
  };

  const t = (key: keyof typeof DICTIONARY.en): string => {
    return DICTIONARY[locale][key] || DICTIONARY.en[key] || key;
  };

  const num = (val: number | string | null | undefined, decimals: number = 2): string => {
    return formatNumber(val, locale, decimals);
  };

  const date = (val: string | Date | null | undefined): string => {
    return formatDate(val, locale);
  };

  return (
    <LocaleThemeContext.Provider
      value={{
        theme,
        locale,
        toggleTheme,
        toggleLocale,
        t,
        num,
        date,
      }}
    >
      {children}
    </LocaleThemeContext.Provider>
  );
}

export function useLocaleTheme() {
  const context = useContext(LocaleThemeContext);
  if (!context) {
    throw new Error('useLocaleTheme must be used within a LocaleThemeProvider');
  }
  return context;
}
