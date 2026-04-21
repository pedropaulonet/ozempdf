import {
  translations,
  type Translation,
  type Locale,
  type ThemeMode,
  type CompressionLevel,
  type LocaleOption
} from "./translations";
import { normalizeLocale } from "./utils";

export const themeStorageKey = "ozempdf-theme";
export const localeStorageKey = "ozempdf-locale";
export const levelStorageKey = "ozempdf-level";
export const outputStorageKey = "ozempdf-output";

export const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

export const localeOptions = [
  { value: "pt-BR", label: "Português" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" }
] satisfies LocaleOption[];

export const sortedLocaleOptions: LocaleOption[] = [...localeOptions].sort((left, right) =>
  left.label.localeCompare(right.label, "und")
);

export let currentTheme: ThemeMode = readStoredTheme();
export let currentLocale: Locale = readStoredLocale();
export let currentLevel: CompressionLevel = readStoredLevel();
export let selectedFiles: string[] = [];
export let outputDirectory = readStoredOutput();
export let ghostscriptReady = false;
export let ghostscriptVersion: string | null = null;
export let ghostscriptInstallationLink: string | null = null;

export function setCurrentTheme(theme: ThemeMode) { currentTheme = theme; }
export function setCurrentLocale(locale: Locale) { currentLocale = locale; }
export function setCurrentLevel(level: CompressionLevel) { currentLevel = level; }
export function setSelectedFiles(files: string[]) { selectedFiles = files; }
export function setOutputDirectory(dir: string) { outputDirectory = dir; }
export function setGhostscriptReady(ready: boolean) { ghostscriptReady = ready; }
export function setGhostscriptVersion(version: string | null) { ghostscriptVersion = version; }
export function setGhostscriptInstallationLink(link: string | null) { ghostscriptInstallationLink = link; }

function readStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(themeStorageKey);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function readStoredLocale(): Locale {
  const stored = localStorage.getItem(localeStorageKey);
  if (stored && stored in translations) {
    return stored as Locale;
  }

  const preferred = [...navigator.languages, navigator.language]
    .filter(Boolean)
    .map(normalizeLocale)
    .find((locale): locale is Locale => locale in translations);

  return preferred ?? "en";
}

function readStoredLevel(): CompressionLevel {
  const stored = localStorage.getItem(levelStorageKey);
  return stored === "max" || stored === "high" || stored === "medium" || stored === "low"
    ? stored
    : "high";
}

function readStoredOutput(): string {
  return localStorage.getItem(outputStorageKey) ?? "";
}

export function t(): Translation {
  return translations[currentLocale];
}

export function translateError(raw: string): string {
  const [key, ...rest] = raw.split("|");
  const translated = t().errors[key];
  const details = rest.join("|");

  if (translated && details) {
    return `${translated} ${details}`;
  }

  return translated ?? raw;
}

export function applyTheme() {
  const resolved = currentTheme === "system"
    ? (mediaQuery.matches ? "dark" : "light")
    : currentTheme;

  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}