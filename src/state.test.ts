import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeLocale } from "./utils";
import { translations } from "./translations";

type Locale = "pt-BR" | "en" | "es" | "fr" | "de" | "it";

function translateErrorWithLocale(locale: Locale, raw: string): string {
  const errorMap = translations[locale].errors;
  const [key, ...rest] = raw.split("|");
  const translated = errorMap[key];
  const details = rest.join("|");
  if (translated && details) {
    return `${translated} ${details}`;
  }
  return translated ?? raw;
}

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })
  });
});

describe("normalizeLocale", () => {
  it("maps pt-BR to pt-BR", () => {
    expect(normalizeLocale("pt-BR")).toBe("pt-BR");
  });

  it("maps pt to pt-BR", () => {
    expect(normalizeLocale("pt")).toBe("pt-BR");
  });

  it("maps pt_PT to pt-BR", () => {
    expect(normalizeLocale("pt_PT")).toBe("pt-BR");
  });

  it("maps en to en", () => {
    expect(normalizeLocale("en")).toBe("en");
  });

  it("maps en-US to en", () => {
    expect(normalizeLocale("en-US")).toBe("en");
  });

  it("maps es to es", () => {
    expect(normalizeLocale("es")).toBe("es");
  });

  it("maps es-AR to es", () => {
    expect(normalizeLocale("es-AR")).toBe("es");
  });

  it("maps fr to fr", () => {
    expect(normalizeLocale("fr")).toBe("fr");
  });

  it("maps de to de", () => {
    expect(normalizeLocale("de")).toBe("de");
  });

  it("maps it to it", () => {
    expect(normalizeLocale("it")).toBe("it");
  });

  it("returns en for unknown locale", () => {
    expect(normalizeLocale("ja")).toBe("en");
  });

  it("is case-insensitive", () => {
    expect(normalizeLocale("PT-BR")).toBe("pt-BR");
    expect(normalizeLocale("EN")).toBe("en");
  });
});

describe("translateError (via local helper)", () => {
  it("translates known error keys", () => {
    expect(translateErrorWithLocale("en", "error.input_not_found")).toBe(
      translations.en.errors["error.input_not_found"]
    );
  });

  it("returns the key when unknown", () => {
    expect(translateErrorWithLocale("en", "error.unknown_key")).toBe("error.unknown_key");
  });

  it("appends pipe-separated details when available", () => {
    const result = translateErrorWithLocale("en", "error.gs_compress_failed|details here");
    expect(result).toBe(
      `${translations.en.errors["error.gs_compress_failed"]} details here`
    );
  });

  it("returns just the translated message when there are no details", () => {
    const result = translateErrorWithLocale("en", "error.gs_compress_failed");
    expect(result).toBe(translations.en.errors["error.gs_compress_failed"]);
  });

  it("translates error keys in pt-BR", () => {
    expect(translateErrorWithLocale("pt-BR", "error.input_not_found")).toBe(
      translations["pt-BR"].errors["error.input_not_found"]
    );
  });
});

describe("t() locale switching via dynamic import", () => {
  it("returns English translation when locale is set to en", async () => {
    const { setCurrentLocale, t } = await import("./state");
    setCurrentLocale("en");
    const result = t();
    expect(result.appName).toBe("OzemPDF");
    expect(result.compress).toBe("Compress PDFs");
  });

  it("returns Portuguese translation when locale is set to pt-BR", async () => {
    const { setCurrentLocale, t } = await import("./state");
    setCurrentLocale("pt-BR");
    expect(t().compress).toBe("Compactar PDFs");
  });

  it("returns Spanish translation when locale is set to es", async () => {
    const { setCurrentLocale, t } = await import("./state");
    setCurrentLocale("es");
    expect(t().compress).toBe("Comprimir PDF");
  });
});