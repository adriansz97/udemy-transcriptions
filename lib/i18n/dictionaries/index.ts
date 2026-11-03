import { en } from "./en";
import { es, type Dictionary } from "./es";
import type { Locale } from "../locale";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
