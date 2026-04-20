import "./styles.css";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import {
  translations,
  type Translation,
  type Locale,
  type ThemeMode,
  type CompressionLevel,
  type LocaleOption
} from "./translations";
import { UIManager } from "./ui";
import { APP_LICENSE, CURATED_DEPENDENCIES, OFFICIAL_LINKS } from "./about";
import { 
  PDFCompressor, 
  type CompressionResponse, 
  type CompressionFailure 
} from "./compressor";

declare const __APP_VERSION__: string;

const themeStorageKey = "ozempdf-theme";
const localeStorageKey = "ozempdf-locale";
const levelStorageKey = "ozempdf-level";
const outputStorageKey = "ozempdf-output";
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const localeOptions = [
  { value: "pt-BR", label: "Português" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" }
] satisfies LocaleOption[];
const sortedLocaleOptions: LocaleOption[] = [...localeOptions].sort((left, right) =>
  left.label.localeCompare(right.label, "und")
);

let currentTheme = readStoredTheme();
let currentLocale = readStoredLocale();
let currentLevel = readStoredLevel();
let selectedFiles: string[] = [];
let outputDirectory = readStoredOutput();
let ghostscriptReady = false;
let ghostscriptVersion: string | null = null;
const logoUrl = new URL("../imagens/ozemPDF.svg", import.meta.url).href;

const ui = new UIManager("#app", logoUrl);
const compressor = new PDFCompressor();

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

function t(): Translation {
  return translations[currentLocale];
}

function translateError(raw: string): string {
  const [key, ...rest] = raw.split("|");
  const translated = t().errors[key];
  const details = rest.join("|");

  if (translated && details) {
    return `${translated} ${details}`;
  }

  return translated ?? raw;
}

function normalizeLocale(locale: string): Locale | "en" {
  const lower = locale.toLowerCase();

  if (lower.startsWith("pt")) {
    return "pt-BR";
  }

  if (lower.startsWith("es")) {
    return "es";
  }

  if (lower.startsWith("fr")) {
    return "fr";
  }

  if (lower.startsWith("de")) {
    return "de";
  }

  if (lower.startsWith("it")) {
    return "it";
  }

  return "en";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setStatus(message: string, tone: "info" | "error" | "success" | "warning") {
  ui.setStatus(message, tone);
}

function setBusy(nextBusy: boolean) {
  ui.setBusy(nextBusy, t(), ghostscriptReady);
}

function applyTheme() {
  const resolved = currentTheme === "system"
    ? (mediaQuery.matches ? "dark" : "light")
    : currentTheme;

  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function baseName(path: string) {
  const segments = path.split(/[/\\]/);
  return segments[segments.length - 1] || path;
}

function joinPath(directory: string, filename: string) {
  const separator = directory.includes("\\") ? "\\" : "/";
  return `${directory}${directory.endsWith(separator) ? "" : separator}${filename}`;
}

function makeOutputPath(inputPath: string) {
  const filename = baseName(inputPath).replace(/\.pdf$/i, "-compressed.pdf");
  return joinPath(outputDirectory, filename);
}

function getSelectedLevel(): CompressionLevel {
  const checked = document.querySelector<HTMLInputElement>(
    'input[name="compression-level"]:checked'
  );

  return checked ? (checked.value as CompressionLevel) : currentLevel;
}

function renderLevelOptions() {
  ui.renderLevelOptions(t(), currentLevel);
}

function renderFileList() {
  ui.renderFileList(
    selectedFiles,
    t(),
    () => {
      selectedFiles = [];
      renderFileList();
      setStatus(t().ready, "info");
      ui.hideResult();
      updateProgress(0, 0);
    },
    baseName,
    escapeHtml
  );
}

function renderOutputFolder() {
  ui.renderOutputFolder(outputDirectory, t().noFolder, escapeHtml);
}

function updateProgress(current: number, total: number, currentFile = "") {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);
  ui.updateProgress(percent, current, total, currentFile, t().progressIdle);
}

function renderStaticText() {
  ui.renderStaticText(
    t(),
    __APP_VERSION__,
    currentTheme,
    currentLocale,
    sortedLocaleOptions,
    OFFICIAL_LINKS,
    CURATED_DEPENDENCIES,
    APP_LICENSE,
    ghostscriptVersion,
    ghostscriptReady,
    compressor.isBusy()
  );
  renderLevelOptions();
  renderFileList();
  renderOutputFolder();
}

async function openExternalLink(url: string) {
  try {
    await compressor.openExternalLink(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(translateError(message), "error");
  }
}

async function syncSystemStatus() {
  try {
    const systemStatus = await compressor.getSystemStatus();
    ghostscriptReady = systemStatus.ghostscriptAvailable;
    ghostscriptVersion = systemStatus.ghostscriptVersion ?? null;
    ui.getCompressButton().disabled = compressor.isBusy() || !ghostscriptReady;
    ui.setAboutGhostscriptValue(ghostscriptVersion, t().aboutUnavailable);

    if (!ghostscriptReady) {
      const details = systemStatus.ghostscriptError
        ? ` ${translateError(systemStatus.ghostscriptError)}`
        : "";
      setStatus(`${t().ghostscriptMissing}${details}`, "warning");
    }
  } catch (error) {
    ghostscriptReady = false;
    ghostscriptVersion = null;
    ui.getCompressButton().disabled = true;
    ui.setAboutGhostscriptValue(ghostscriptVersion, t().aboutUnavailable);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`${t().ghostscriptMissing} ${translateError(message)}`, "warning");
  }
}

function renderSummary(results: CompressionResponse[], failures: CompressionFailure[]) {
  ui.renderSummary(
    results,
    failures,
    t(),
    outputDirectory,
    formatBytes,
    baseName,
    escapeHtml,
    () => {
      void openExternalLink(outputDirectory);
    }
  );
}

ui.getSelectInputButton().addEventListener("click", async () => {
  const selected = await open({
    title: t().choosePdfs,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
    multiple: true
  });

  if (!selected) {
    return;
  }

  selectedFiles = Array.isArray(selected) ? selected : [selected];
  renderFileList();
  ui.hideResult();
  setStatus(t().filesSelected, "info");
  updateProgress(0, 0);
});

ui.getSelectOutputButton().addEventListener("click", async () => {
  const selected = await open({
    title: t().chooseFolder,
    directory: true,
    multiple: false
  });

  if (typeof selected !== "string") {
    return;
  }

  outputDirectory = selected;
  localStorage.setItem(outputStorageKey, outputDirectory);
  renderOutputFolder();
  setStatus(t().folderSelected, "info");
});

ui.getLevelOptionsEl().addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.name !== "compression-level") {
    return;
  }

  currentLevel = target.value as CompressionLevel;
  localStorage.setItem(levelStorageKey, currentLevel);
});

ui.getCompressButton().addEventListener("click", async () => {
  if (compressor.isBusy()) {
    compressor.requestCancel();
    ui.getCompressButton().disabled = true;
    return;
  }

  if (!ghostscriptReady) {
    setStatus(t().ghostscriptMissing, "warning");
    return;
  }

  if (selectedFiles.length === 0) {
    setStatus(t().chooseFilesFirst, "error");
    return;
  }

  if (!outputDirectory) {
    setStatus(t().chooseFolderFirst, "error");
    return;
  }

  const level = getSelectedLevel();
  compressor.resetCancel();
  setBusy(true);
  ui.hideResult();
  updateProgress(0, selectedFiles.length);
  setStatus(`${t().compressing} 0/${selectedFiles.length}`, "info");

  try {
    const { results, failures } = await compressor.compressBatch(
      selectedFiles,
      outputDirectory,
      level,
      (index, currentFile) => {
        updateProgress(index, selectedFiles.length, currentFile);
        if (index < selectedFiles.length) {
          setStatus(
            `${t().currentFile}: ${currentFile} (${index + 1}/${selectedFiles.length})`,
            "info"
          );
        }
      },
      baseName,
      makeOutputPath
    );

    const translatedFailures = failures.map(f => ({
      ...f,
      message: translateError(f.message)
    }));

    if (results.length > 0) {
      renderSummary(results, translatedFailures);
    }

    if (compressor.isCancelRequested()) {
      setStatus(t().cancelled, "warning");
    } else if (translatedFailures.length === 0) {
      setStatus(t().finished, "success");
    } else if (results.length > 0) {
      setStatus(
        `${t().partialFinished} ${translatedFailures.length}/${selectedFiles.length}`,
        "warning"
      );
    } else {
      const firstFailure = translatedFailures[0]?.message ?? t().failedBatch;
      setStatus(`${t().failedBatch} ${firstFailure}`, "error");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`${t().failedBatch} ${translateError(message)}`, "error");
  } finally {
    setBusy(false);
  }
});

ui.getThemeSelect().addEventListener("change", () => {
  currentTheme = ui.getThemeSelect().value as ThemeMode;
  localStorage.setItem(themeStorageKey, currentTheme);
  applyTheme();
});

ui.getLocaleSelect().addEventListener("change", () => {
  currentLocale = ui.getLocaleSelect().value as Locale;
  localStorage.setItem(localeStorageKey, currentLocale);
  renderStaticText();

  if (!ghostscriptReady) {
    setStatus(t().ghostscriptMissing, "warning");
  }
});

ui.getAboutButton().addEventListener("click", () => {
  ui.getAboutDialog().showModal();
});

ui.getAboutCloseButton().addEventListener("click", () => {
  ui.getAboutDialog().close();
});

ui.getAboutDialog().addEventListener("click", (event) => {
  if (event.target instanceof HTMLDialogElement) {
    ui.getAboutDialog().close();
  }
});

ui.getAboutDonationLink().addEventListener("click", (event) => {
  event.preventDefault();
  void openExternalLink(OFFICIAL_LINKS.donation);
});

ui.getAboutWebsiteLink().addEventListener("click", (event) => {
  event.preventDefault();
  void openExternalLink(OFFICIAL_LINKS.website);
});

mediaQuery.addEventListener("change", () => {
  if (currentTheme === "system") {
    applyTheme();
  }
});

getCurrentWindow().onDragDropEvent((event) => {
  if (event.payload.type === "enter" || event.payload.type === "over") {
    ui.getPanelEl().classList.add("drop-active");
  } else if (event.payload.type === "leave") {
    ui.getPanelEl().classList.remove("drop-active");
  } else if (event.payload.type === "drop") {
    ui.getPanelEl().classList.remove("drop-active");

    if (compressor.isBusy()) return;

    const paths = event.payload.paths;
    if (!paths || paths.length === 0) return;

    const pdfPaths: string[] = [];
    for (const path of paths) {
      if (path.toLowerCase().endsWith(".pdf")) {
        pdfPaths.push(path);
      }
    }

    if (pdfPaths.length === 0) return;

    const existingSet = new Set(selectedFiles);
    for (const path of pdfPaths) {
      if (!existingSet.has(path)) {
        selectedFiles.push(path);
        existingSet.add(path);
      }
    }

    renderFileList();
    ui.hideResult();
    setStatus(t().filesSelected, "info");
    updateProgress(0, 0);
  }
});

applyTheme();
renderStaticText();
setStatus(t().ready, "info");
updateProgress(0, 0);
void syncSystemStatus();
