import { DEFAULT_LOCALE, isLocale, resolveLocale, type Locale } from "./locale";

export const LOCALE_STORAGE_KEY = "udemy-transcripts:locale";

let currentLocale: Locale | null = null;
const listeners = new Set<() => void>();

function readStoredLocale(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function detectLocale(): Locale {
  const languages =
    typeof navigator === "undefined" ? [] : (navigator.languages ?? [navigator.language]);

  return resolveLocale(languages, readStoredLocale());
}

export function getLocaleSnapshot(): Locale {
  currentLocale ??= detectLocale();
  return currentLocale;
}

export function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function subscribeToLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setLocale(next: Locale): void {
  if (!isLocale(next) || next === currentLocale) return;

  currentLocale = next;

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Almacenamiento bloqueado: el idioma sigue vigente en memoria.
  }

  for (const listener of listeners) listener();
}
