export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

export function resolveLocale(
  languages: readonly string[],
  stored?: string | null
): Locale {
  if (isLocale(stored)) return stored;

  for (const language of languages) {
    const tag = language.toLowerCase();
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("en")) return "en";
  }

  return DEFAULT_LOCALE;
}
