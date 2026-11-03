import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveLocale } from "@/lib/i18n/locale";
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";

function shape(value: unknown): unknown {
  if (typeof value === "function") return "function";
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(
      ([key, entry]) => [key, shape(entry)] as const
    );

    entries.sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(entries);
  }

  return typeof value;
}

describe("dictionaries", () => {
  it("expose the same keys and value kinds", () => {
    expect(shape(en)).toEqual(shape(es));
  });

  it("pluralize the download message for both locales", () => {
    expect(es.download.missing(1)).toBe("Falta 1 clase por completar para descargar.");
    expect(es.download.missing(3)).toBe("Faltan 3 clases por completar para descargar.");
    expect(en.download.missing(1)).toBe("1 lesson left to complete before downloading.");
    expect(en.download.missing(3)).toBe("3 lessons left to complete before downloading.");
  });

  it("pluralize the sidebar progress", () => {
    expect(es.sidebar.progress(1, 1)).toBe("1 de 1 clase");
    expect(es.sidebar.progress(2, 5)).toBe("2 de 5 clases");
    expect(en.sidebar.progress(2, 5)).toBe("2 of 5 lessons");
  });
});

describe("resolveLocale", () => {
  it("prefers a stored supported locale", () => {
    expect(resolveLocale(["en-US"], "es")).toBe("es");
  });

  it("detects Spanish and English browser languages", () => {
    expect(resolveLocale(["es-ES", "en-US"])).toBe("es");
    expect(resolveLocale(["en-GB", "es"])).toBe("en");
  });

  it("falls back to English for unsupported languages", () => {
    expect(resolveLocale(["fr-FR", "de"])).toBe("en");
    expect(resolveLocale([])).toBe("en");
  });

  it("ignores unsupported stored values", () => {
    expect(resolveLocale(["es-ES"], "fr")).toBe("es");
  });
});

describe("locale store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  it("detects the stored locale on the first snapshot", async () => {
    window.localStorage.setItem("udemy-transcripts:locale", "es");
    const store = await import("@/lib/i18n/store");

    expect(store.getLocaleSnapshot()).toBe("es");
  });

  it("persists changes and notifies subscribers", async () => {
    const store = await import("@/lib/i18n/store");
    const listener = vi.fn();
    const unsubscribe = store.subscribeToLocale(listener);

    store.setLocale("es");

    expect(store.getLocaleSnapshot()).toBe("es");
    expect(window.localStorage.getItem("udemy-transcripts:locale")).toBe("es");
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
  });
});
