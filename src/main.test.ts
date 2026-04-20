import { beforeEach, describe, expect, it, vi } from "vitest";
import { translations, type Locale, type LocaleOption } from "./translations";
import { APP_LICENSE, CURATED_DEPENDENCIES, OFFICIAL_LINKS } from "./about";
import { UIManager } from "./ui";

const openMock = vi.fn();
const onDragDropEventMock = vi.fn();
const compressorMocks = {
  compressBatch: vi.fn(),
  getSystemStatus: vi.fn(),
  openExternalLink: vi.fn(),
  isBusy: vi.fn(),
  requestCancel: vi.fn(),
  resetCancel: vi.fn(),
  isCancelRequested: vi.fn()
};

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: openMock
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    onDragDropEvent: onDragDropEventMock
  })
}));

vi.mock("./compressor", () => ({
  PDFCompressor: class {
    public compressBatch = compressorMocks.compressBatch;
    public getSystemStatus = compressorMocks.getSystemStatus;
    public openExternalLink = compressorMocks.openExternalLink;
    public isBusy = compressorMocks.isBusy;
    public requestCancel = compressorMocks.requestCancel;
    public resetCancel = compressorMocks.resetCancel;
    public isCancelRequested = compressorMocks.isCancelRequested;
  }
}));

const localeOptions: LocaleOption[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Portugues" }
];

function renderAboutDialog(locale: Locale = "en", ghostscriptVersion: string | null = "10.05.1") {
  document.body.innerHTML = '<div id="app"></div>';

  const ui = new UIManager("#app", "/logo.svg");
  ui.renderStaticText(
    translations[locale],
    "0.1.0-beta.2",
    "system",
    locale,
    localeOptions,
    OFFICIAL_LINKS,
    CURATED_DEPENDENCIES,
    APP_LICENSE,
    ghostscriptVersion,
    false,
    false
  );

  return ui;
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("About dialog", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    vi.resetModules();
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })
    });
    Object.defineProperty(globalThis, "__APP_VERSION__", {
      configurable: true,
      value: "0.1.0-beta.2"
    });
    compressorMocks.getSystemStatus.mockResolvedValue({
      ghostscriptAvailable: true,
      ghostscriptVersion: "10.05.1",
      ghostscriptError: null
    });
    compressorMocks.openExternalLink.mockResolvedValue(undefined);
    compressorMocks.isBusy.mockReturnValue(false);
    compressorMocks.isCancelRequested.mockReturnValue(false);
  });

  it("scopes UIManager bindings and dynamic action hooks to its root", () => {
    document.body.innerHTML = `
      <button id="clear-files-button" type="button">rogue clear</button>
      <button id="open-output-folder" type="button">rogue open</button>
      <div class="panel" data-panel-owner="rogue"></div>
      <div id="app"></div>
    `;

    const ui = new UIManager("#app", "/logo.svg");
    const app = document.querySelector("#app");
    const clearSpy = { count: 0 };
    const openSpy = { count: 0 };

    ui.renderFileList(["/tmp/report.pdf"], translations.en, () => {
      clearSpy.count += 1;
    }, (path) => path.split("/").pop() ?? path, (path) => path);

    ui.renderSummary(
      [{
        inputPath: "/tmp/report.pdf",
        outputPath: "/tmp/out/report.pdf",
        originalSizeBytes: 100,
        compressedSizeBytes: 50,
        reductionPercent: 50,
        preset: "/ebook"
      }],
      [],
      translations.en,
      "/tmp/out",
      (bytes) => `${bytes} B`,
      (path) => path.split("/").pop() ?? path,
      (path) => path,
      () => {
        openSpy.count += 1;
      }
    );

    const clearButton = app?.querySelector<HTMLButtonElement>("#file-list .link-button");
    const openButton = app?.querySelector<HTMLButtonElement>(".result-actions .secondary");

    expect(clearButton).not.toBeNull();
    expect(openButton).not.toBeNull();

    clearButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    openButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(clearSpy.count).toBe(1);
    expect(openSpy.count).toBe(1);
    expect(ui.getPanelEl().getAttribute("data-panel-owner")).toBeNull();
    expect(ui.getPanelEl().closest("#app")).not.toBeNull();
  });

  it("renders About dependencies as grouped, role-focused sections", () => {
    renderAboutDialog();

    expect(document.querySelector(".app-header .settings-group #about-button")).not.toBeNull();
    expect(document.querySelector("#about-summary-section")).not.toBeNull();
    expect(document.querySelector("#about-details-section")).not.toBeNull();
    expect(document.querySelector("#about-links-section")).not.toBeNull();
    expect(document.querySelector("#about-dependencies-section")).not.toBeNull();
    expect(document.querySelector("#about-license-value")?.textContent).toBe(APP_LICENSE);

    const dependencyGroups = document.querySelectorAll("#about-dependencies-list .about-dependency-group");
    const dependencyCopy = document.querySelector("#about-dependencies-list")?.textContent ?? "";

    expect(dependencyGroups).toHaveLength(CURATED_DEPENDENCIES.length);
    expect(dependencyCopy).toContain("Core app");
    expect(dependencyCopy).toContain("PDF engine");
    expect(dependencyCopy).toContain("QA/build");
    expect(dependencyCopy).toContain("desktop runtime and native window shell");
    expect(dependencyCopy).toContain("cross-platform URL and file opener");
    expect(dependencyCopy).toContain("PDF compression engine used for output generation");
    expect(dependencyCopy).toContain("test runner covering UI behavior and regressions");
  });

  it("hydrates official About links from centralized About data", () => {
    renderAboutDialog();

    const websiteLink = document.querySelector<HTMLAnchorElement>("#about-website-link");
    const donationLink = document.querySelector<HTMLAnchorElement>("#about-donation-link");

    expect(websiteLink?.getAttribute("href")).toBe(OFFICIAL_LINKS.website);
    expect(websiteLink?.textContent).toBe(translations.en.website);
    expect(donationLink?.getAttribute("href")).toBe(OFFICIAL_LINKS.donation);
    expect(donationLink?.textContent).toBe(translations.en.donation);
  });

  it("updates About labels and rendered values when locale changes", () => {
    renderAboutDialog("pt-BR", null);

    expect(document.querySelector("#about-title")?.textContent).toBe(translations["pt-BR"].aboutTitle);
    expect(document.querySelector("#about-summary-title")?.textContent).toBe(translations["pt-BR"].aboutSummary);
    expect(document.querySelector("#about-summary-copy")?.textContent).toBe(translations["pt-BR"].intro);
    expect(document.querySelector("#about-links-title")?.textContent).toBe(translations["pt-BR"].aboutLinks);
    expect(document.querySelector("#about-created-label")?.textContent).toBe(translations["pt-BR"].createdBy);
    expect(document.querySelector("#about-version-label")?.textContent).toBe(translations["pt-BR"].version);
    expect(document.querySelector("#about-version-value")?.textContent).toBe("0.1.0-beta.2");
    expect(document.querySelector("#about-license-label")?.textContent).toBe(translations["pt-BR"].license);
    expect(document.querySelector("#about-license-value")?.textContent).toBe(APP_LICENSE);
    expect(document.querySelector("#about-gs-label")?.textContent).toBe(translations["pt-BR"].ghostscriptVersion);
    expect(document.querySelector("#about-gs-value")?.textContent).toBe(translations["pt-BR"].aboutUnavailable);
    expect(document.querySelector("#about-website-link")?.textContent).toBe(translations["pt-BR"].website);
    expect(document.querySelector("#about-donation-link")?.textContent).toBe(translations["pt-BR"].donation);
  });

  it("shows a readable Ghostscript unavailable fallback instead of hiding the row", () => {
    renderAboutDialog("en", null);

    const ghostscriptValue = document.querySelector("#about-gs-value");
    const ghostscriptRow = document.querySelector("#about-gs-row");

    expect(ghostscriptRow?.classList.contains("hidden")).toBe(false);
    expect(ghostscriptValue?.textContent).toBe(translations.en.aboutUnavailable);
  });

  it("resets the busy UI and shows a translated error when batch compression throws", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    openMock
      .mockResolvedValueOnce(["/tmp/report.pdf"])
      .mockResolvedValueOnce("/tmp/out");
    compressorMocks.compressBatch.mockRejectedValueOnce(new Error("error.gs_execution_failed"));

    await import("./main");
    await flushPromises();

    document.querySelector<HTMLButtonElement>("#select-input")?.click();
    await flushPromises();
    document.querySelector<HTMLButtonElement>("#select-output")?.click();
    await flushPromises();
    document.querySelector<HTMLButtonElement>("#compress-button")?.click();
    await flushPromises();

    expect(document.querySelector<HTMLButtonElement>("#select-input")?.disabled).toBe(false);
    expect(document.querySelector<HTMLButtonElement>("#select-output")?.disabled).toBe(false);
    expect(document.querySelector<HTMLButtonElement>("#about-button")?.disabled).toBe(false);
    expect(document.querySelector<HTMLButtonElement>("#compress-button")?.textContent).toBe(translations.en.compress);
    expect(document.querySelector<HTMLButtonElement>("#compress-button")?.classList.contains("cancel")).toBe(false);
    expect(document.querySelector("#status")?.textContent).toBe(
      `${translations.en.failedBatch} ${translations.en.errors["error.gs_execution_failed"]}`
    );
    expect(document.querySelector("#status")?.className).toContain("error");
  });

  it("keeps the localized About copy polished and consistent", () => {
    expect({
      ptBR: {
        aboutDependencies: translations["pt-BR"].aboutDependencies,
        website: translations["pt-BR"].website,
        aboutUnavailable: translations["pt-BR"].aboutUnavailable
      },
      es: {
        website: translations.es.website
      },
      fr: {
        aboutTitle: translations.fr.aboutTitle,
        aboutSummary: translations.fr.aboutSummary,
        aboutDetails: translations.fr.aboutDetails,
        aboutDependencies: translations.fr.aboutDependencies
      },
      de: {
        about: translations.de.about,
        aboutDependencies: translations.de.aboutDependencies,
        aboutUnavailable: translations.de.aboutUnavailable
      },
      it: {
        about: translations.it.about
      }
    }).toEqual({
      ptBR: {
        aboutDependencies: "Dependências",
        website: "Site do projeto",
        aboutUnavailable: "Indisponível"
      },
      es: {
        website: "Sitio del proyecto"
      },
      fr: {
        aboutTitle: "À propos d'OzemPDF",
        aboutSummary: "Résumé",
        aboutDetails: "Détails",
        aboutDependencies: "Dépendances"
      },
      de: {
        about: "Über",
        aboutDependencies: "Abhängigkeiten",
        aboutUnavailable: "Nicht verfügbar"
      },
      it: {
        about: "Informazioni"
      }
    });
  });

  it("renders compression level options for the current locale", () => {
    const ui = renderAboutDialog("en");
    ui.renderLevelOptions(translations.en, "high");

    const levels = document.querySelectorAll<HTMLInputElement>(
      'input[name="compression-level"]'
    );

    expect(levels).toHaveLength(4);

    const values = Array.from(levels).map((input) => input.value);
    expect(values).toContain("max");
    expect(values).toContain("high");
    expect(values).toContain("medium");
    expect(values).toContain("low");
  });

  it("renders the high level as checked by default when no stored preference exists", () => {
    const ui = renderAboutDialog("en");
    ui.renderLevelOptions(translations.en, "high");

    const checked = document.querySelector<HTMLInputElement>(
      'input[name="compression-level"]:checked'
    );

    expect(checked).not.toBeNull();
    expect(checked?.value).toBe("high");
  });

  it("renders level labels from the current locale", () => {
    const ui = renderAboutDialog("pt-BR");
    ui.renderLevelOptions(translations["pt-BR"], "high");

    const labels = document.querySelectorAll(".level-copy strong");
    const labelTexts = Array.from(labels).map((el) => el.textContent);

    expect(labelTexts).toContain("Máxima");
    expect(labelTexts).toContain("Alta");
    expect(labelTexts).toContain("Equilibrada");
    expect(labelTexts).toContain("Qualidade");
  });
});
