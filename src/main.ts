import "./styles.css";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { UIManager } from "./ui";
import { APP_LICENSE, CURATED_DEPENDENCIES, OFFICIAL_LINKS } from "./about";
import {
  PDFCompressor,
  type CompressionResponse,
  type CompressionFailure
} from "./compressor";
import {
  APP_VERSION,
  themeStorageKey,
  localeStorageKey,
  levelStorageKey,
  outputStorageKey,
  mediaQuery,
  sortedLocaleOptions,
  currentTheme,
  currentLocale,
  currentLevel,
  selectedFiles,
  outputDirectory,
  ghostscriptReady,
  ghostscriptVersion,
  setCurrentTheme,
  setCurrentLocale,
  setCurrentLevel,
  setSelectedFiles,
  setOutputDirectory,
  setGhostscriptReady,
  setGhostscriptVersion,
  t,
  translateError,
  applyTheme
} from "./state";
import {
  baseName,
  escapeHtml,
  formatBytes,
  makeOutputPath
} from "./utils";
import type { ThemeMode, Locale, CompressionLevel } from "./translations";

const logoUrl = new URL("../images/ozemPDF.svg", import.meta.url).href;

const ui = new UIManager("#app", logoUrl);
const compressor = new PDFCompressor();

function setStatus(message: string, tone: "info" | "error" | "success" | "warning") {
  ui.setStatus(message, tone);
}

function setBusy(nextBusy: boolean) {
  ui.setBusy(nextBusy, t(), ghostscriptReady);
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
      setSelectedFiles([]);
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
    APP_VERSION,
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
    setGhostscriptReady(systemStatus.ghostscriptAvailable);
    setGhostscriptVersion(systemStatus.ghostscriptVersion ?? null);
    ui.getCompressButton().disabled = compressor.isBusy() || !ghostscriptReady;
    ui.setAboutGhostscriptValue(ghostscriptVersion, t().aboutUnavailable);

    if (!ghostscriptReady) {
      const details = systemStatus.ghostscriptError
        ? ` ${translateError(systemStatus.ghostscriptError)}`
        : "";
      setStatus(`${t().ghostscriptMissing}${details}`, "warning");
    }
  } catch (error) {
    setGhostscriptReady(false);
    setGhostscriptVersion(null);
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

  setSelectedFiles(Array.isArray(selected) ? selected : [selected]);
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

  setOutputDirectory(selected);
  localStorage.setItem(outputStorageKey, outputDirectory);
  renderOutputFolder();
  setStatus(t().folderSelected, "info");
});

ui.getLevelOptionsEl().addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.name !== "compression-level") {
    return;
  }

  setCurrentLevel(target.value as CompressionLevel);
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
      (inputPath: string) => makeOutputPath(inputPath, outputDirectory)
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
  setCurrentTheme(ui.getThemeSelect().value as ThemeMode);
  localStorage.setItem(themeStorageKey, currentTheme);
  applyTheme();
});

ui.getLocaleSelect().addEventListener("change", () => {
  setCurrentLocale(ui.getLocaleSelect().value as Locale);
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