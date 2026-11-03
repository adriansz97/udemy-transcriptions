"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { dictionaryFor, type Dictionary } from "./dictionaries";
import type { Locale } from "./locale";
import {
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  setLocale,
  subscribeToLocale,
} from "./store";

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  );
  const t = useMemo(() => dictionaryFor(locale), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.app.title;
  }, [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within LanguageProvider");
  return value;
}
