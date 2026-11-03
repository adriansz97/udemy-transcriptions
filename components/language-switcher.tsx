"use client";

import { useI18n } from "@/lib/i18n/context";
import { LOCALES } from "@/lib/i18n/locale";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className="inline-flex overflow-hidden rounded-lg border border-zinc-300 text-xs font-medium dark:border-zinc-700"
    >
      {LOCALES.map((option) => {
        const active = option === locale;

        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            aria-label={t.language[option]}
            onClick={() => setLocale(option)}
            className={`px-2.5 py-1 uppercase transition ${
              active
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
