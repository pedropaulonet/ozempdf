import {
  type Translation,
  type Locale,
  type ThemeMode,
  type CompressionLevel,
  type LocaleOption
} from "./translations";
import type { CompressionFailure, CompressionResponse } from "./compressor";
import type { CuratedDependencyGroup, OfficialLinks } from "./about";

export class UIManager {
  // DOM elements
  private app: HTMLDivElement;
  private panelEl!: HTMLElement;
  private eyebrowEl!: HTMLParagraphElement;
  private titleEl!: HTMLHeadingElement;
  private introEl!: HTMLParagraphElement;
  private appearanceLabelEl!: HTMLSpanElement;
  private languageLabelEl!: HTMLSpanElement;
  private themeSelect!: HTMLSelectElement;
  private localeSelect!: HTMLSelectElement;
  private aboutButton!: HTMLButtonElement;
  private aboutDialog!: HTMLDialogElement;
  private aboutTitleEl!: HTMLHeadingElement;
  private aboutCloseButton!: HTMLButtonElement;
  private aboutSummaryTitleEl!: HTMLHeadingElement;
  private aboutSummaryCopyEl!: HTMLParagraphElement;
  private aboutDetailsTitleEl!: HTMLHeadingElement;
  private aboutLinksTitleEl!: HTMLHeadingElement;
  private aboutDependenciesTitleEl!: HTMLHeadingElement;
  private aboutCreatedLabelEl!: HTMLElement;
  private aboutVersionLabelEl!: HTMLElement;
  private aboutVersionValueEl!: HTMLElement;
  private aboutLicenseLabelEl!: HTMLElement;
  private aboutLicenseValueEl!: HTMLElement;
  private aboutGsLabelEl!: HTMLElement;
  private aboutGsValueEl!: HTMLElement;
  private aboutDonationLinkEl!: HTMLAnchorElement;
  private aboutWebsiteLinkEl!: HTMLAnchorElement;
  private aboutDependenciesListEl!: HTMLUListElement;
  private fileListEl!: HTMLDivElement;
  private outputFolderEl!: HTMLDivElement;
  private filesLabelEl!: HTMLLabelElement;
  private folderLabelEl!: HTMLLabelElement;
  private levelsLegendEl!: HTMLLegendElement;
  private levelOptionsEl!: HTMLDivElement;
  private progressLabelEl!: HTMLElement;
  private progressTextEl!: HTMLSpanElement;
  private progressTrackEl!: HTMLDivElement;
  private progressBarEl!: HTMLDivElement;
  private statusEl!: HTMLDivElement;
  private resultEl!: HTMLDivElement;
  private compressButton!: HTMLButtonElement;
  private selectInputButton!: HTMLButtonElement;
  private selectOutputButton!: HTMLButtonElement;

  constructor(appId: string, logoUrl: string) {
    const app = document.querySelector<HTMLDivElement>(appId);
    if (!app) {
      throw new Error(`Element ${appId} not found.`);
    }
    this.app = app;
    this.initLayout(logoUrl);
    this.bindElements();
  }

  private initLayout(logoUrl: string) {
    this.app.innerHTML = `
      <main class="shell">
        <header class="app-header">
          <div class="topbar">
            <div class="settings-group">
              <label class="setting">
                <span id="appearance-label"></span>
                <select id="theme-select">
                  <option value="system"></option>
                  <option value="light"></option>
                  <option value="dark"></option>
                </select>
              </label>
              <label class="setting">
                <span id="language-label"></span>
                <select id="locale-select"></select>
              </label>
              <button id="about-button" class="ghost" type="button"></button>
            </div>
          </div>
        </header>

        <section class="hero">
          <div class="brand-row">
            <img class="brand-logo" src="${logoUrl}" alt="OzemPDF" />
            <div class="brand-copy">
              <p id="eyebrow" class="eyebrow"></p>
              <h1 id="title"></h1>
            </div>
          </div>
          <p id="intro" class="intro"></p>
        </section>

        <section class="panel">
          <div class="field">
            <label id="files-label" for="file-list"></label>
            <div class="picker-row">
              <div id="file-list" class="picker-display"></div>
              <button id="select-input" class="secondary" type="button"></button>
            </div>
          </div>

          <div class="field">
            <label id="folder-label" for="output-folder"></label>
            <div class="picker-row">
              <div id="output-folder" class="picker-display"></div>
              <button id="select-output" class="secondary" type="button"></button>
            </div>
          </div>

          <fieldset class="levels">
            <legend id="levels-legend"></legend>
            <div id="level-options"></div>
          </fieldset>

          <div class="actions">
            <button id="compress-button" class="primary" type="button"></button>
          </div>

          <div class="progress-block">
            <div class="progress-meta">
              <strong id="progress-label"></strong>
              <span id="progress-text" aria-live="polite"></span>
            </div>
            <div
              id="progress-track"
              class="progress-track"
              role="progressbar"
              aria-labelledby="progress-label"
              aria-describedby="progress-text"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="0"
            >
              <div id="progress-bar" class="progress-bar"></div>
            </div>
          </div>

          <div id="status" class="status info" role="status" aria-live="polite"></div>
          <div id="result" class="result hidden" aria-live="polite"></div>
        </section>

        <dialog id="about-dialog" class="about-dialog">
          <article class="about-card">
            <div class="about-head">
              <h2 id="about-title"></h2>
              <button id="about-close" class="ghost" type="button"></button>
            </div>
            <section id="about-summary-section" class="about-section">
              <h3 id="about-summary-title"></h3>
              <p id="about-summary-copy"></p>
            </section>
            <section id="about-details-section" class="about-section">
              <h3 id="about-details-title"></h3>
              <dl class="about-details-list">
                <div>
                  <dt id="about-created-label"></dt>
                  <dd>Pedro Paulo</dd>
                </div>
                <div>
                  <dt id="about-version-label"></dt>
                  <dd id="about-version-value"></dd>
                </div>
                <div>
                  <dt id="about-license-label"></dt>
                  <dd id="about-license-value"></dd>
                </div>
                <div id="about-gs-row">
                  <dt id="about-gs-label"></dt>
                  <dd id="about-gs-value"></dd>
                </div>
              </dl>
            </section>
            <section id="about-links-section" class="about-section">
              <h3 id="about-links-title"></h3>
              <ul id="about-links-list">
                <li>
                  <a id="about-website-link" href="#" target="_blank" rel="noreferrer"></a>
                </li>
                <li>
                  <a id="about-donation-link" href="#" target="_blank" rel="noreferrer"></a>
                </li>
              </ul>
            </section>
            <section id="about-dependencies-section" class="about-section">
              <h3 id="about-dependencies-title"></h3>
              <ul id="about-dependencies-list"></ul>
            </section>
          </article>
        </dialog>
      </main>
    `;
  }

  private bindElements() {
    this.panelEl = this.queryWithinRoot<HTMLElement>(".panel");
    this.eyebrowEl = this.queryWithinRoot<HTMLParagraphElement>("#eyebrow");
    this.titleEl = this.queryWithinRoot<HTMLHeadingElement>("#title");
    this.introEl = this.queryWithinRoot<HTMLParagraphElement>("#intro");
    this.appearanceLabelEl = this.queryWithinRoot<HTMLSpanElement>("#appearance-label");
    this.languageLabelEl = this.queryWithinRoot<HTMLSpanElement>("#language-label");
    this.themeSelect = this.queryWithinRoot<HTMLSelectElement>("#theme-select");
    this.localeSelect = this.queryWithinRoot<HTMLSelectElement>("#locale-select");
    this.aboutButton = this.queryWithinRoot<HTMLButtonElement>("#about-button");
    this.aboutDialog = this.queryWithinRoot<HTMLDialogElement>("#about-dialog");
    this.aboutTitleEl = this.queryWithinRoot<HTMLHeadingElement>("#about-title");
    this.aboutCloseButton = this.queryWithinRoot<HTMLButtonElement>("#about-close");
    this.aboutSummaryTitleEl = this.queryWithinRoot<HTMLHeadingElement>("#about-summary-title");
    this.aboutSummaryCopyEl = this.queryWithinRoot<HTMLParagraphElement>("#about-summary-copy");
    this.aboutDetailsTitleEl = this.queryWithinRoot<HTMLHeadingElement>("#about-details-title");
    this.aboutLinksTitleEl = this.queryWithinRoot<HTMLHeadingElement>("#about-links-title");
    this.aboutDependenciesTitleEl = this.queryWithinRoot<HTMLHeadingElement>("#about-dependencies-title");
    this.aboutCreatedLabelEl = this.queryWithinRoot<HTMLElement>("#about-created-label");
    this.aboutVersionLabelEl = this.queryWithinRoot<HTMLElement>("#about-version-label");
    this.aboutVersionValueEl = this.queryWithinRoot<HTMLElement>("#about-version-value");
    this.aboutLicenseLabelEl = this.queryWithinRoot<HTMLElement>("#about-license-label");
    this.aboutLicenseValueEl = this.queryWithinRoot<HTMLElement>("#about-license-value");
    this.aboutGsLabelEl = this.queryWithinRoot<HTMLElement>("#about-gs-label");
    this.aboutGsValueEl = this.queryWithinRoot<HTMLElement>("#about-gs-value");
    this.aboutDonationLinkEl = this.queryWithinRoot<HTMLAnchorElement>("#about-donation-link");
    this.aboutWebsiteLinkEl = this.queryWithinRoot<HTMLAnchorElement>("#about-website-link");
    this.aboutDependenciesListEl = this.queryWithinRoot<HTMLUListElement>("#about-dependencies-list");
    this.fileListEl = this.queryWithinRoot<HTMLDivElement>("#file-list");
    this.outputFolderEl = this.queryWithinRoot<HTMLDivElement>("#output-folder");
    this.filesLabelEl = this.queryWithinRoot<HTMLLabelElement>("#files-label");
    this.folderLabelEl = this.queryWithinRoot<HTMLLabelElement>("#folder-label");
    this.levelsLegendEl = this.queryWithinRoot<HTMLLegendElement>("#levels-legend");
    this.levelOptionsEl = this.queryWithinRoot<HTMLDivElement>("#level-options");
    this.progressLabelEl = this.queryWithinRoot<HTMLElement>("#progress-label");
    this.progressTextEl = this.queryWithinRoot<HTMLSpanElement>("#progress-text");
    this.progressTrackEl = this.queryWithinRoot<HTMLDivElement>("#progress-track");
    this.progressBarEl = this.queryWithinRoot<HTMLDivElement>("#progress-bar");
    this.statusEl = this.queryWithinRoot<HTMLDivElement>("#status");
    this.resultEl = this.queryWithinRoot<HTMLDivElement>("#result");
    this.compressButton = this.queryWithinRoot<HTMLButtonElement>("#compress-button");
    this.selectInputButton = this.queryWithinRoot<HTMLButtonElement>("#select-input");
    this.selectOutputButton = this.queryWithinRoot<HTMLButtonElement>("#select-output");
  }

  private queryWithinRoot<T extends Element>(selector: string): T {
    const element = this.app.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Failed to bind element ${selector}.`);
    }

    return element;
  }

  // UI update methods
  public setStatus(message: string, tone: "info" | "error" | "success" | "warning") {
    this.statusEl.textContent = message;
    this.statusEl.className = `status ${tone}`;
  }

  public setBusy(busy: boolean, t: Translation, ghostscriptReady: boolean) {
    this.selectInputButton.disabled = busy;
    this.selectOutputButton.disabled = busy;
    this.themeSelect.disabled = busy;
    this.localeSelect.disabled = busy;
    this.aboutButton.disabled = busy;

    if (busy) {
      this.compressButton.textContent = t.cancel;
      this.compressButton.classList.add("cancel");
      this.compressButton.disabled = false;
    } else {
      this.compressButton.textContent = ghostscriptReady ? t.compress : t.compress;
      this.compressButton.classList.remove("cancel");
      this.compressButton.disabled = !ghostscriptReady;
    }

    const clearBtn = this.fileListEl.querySelector<HTMLButtonElement>(".picker-header .link-button");
    if (clearBtn) clearBtn.disabled = busy;
  }

  public updateProgress(percent: number, current: number, total: number, currentFile: string, idleText: string) {
    this.progressBarEl.style.width = `${percent}%`;
    this.progressTrackEl.setAttribute("aria-valuenow", String(percent));
    this.progressTextEl.textContent = total === 0
      ? idleText
      : `${percent}% · ${current}/${total}${currentFile ? ` · ${currentFile}` : ""}`;
  }

  public renderFileList(
    selectedFiles: string[],
    t: Translation,
    onClear: () => void,
    baseName: (path: string) => string,
    escapeHtml: (path: string) => string
  ) {
    if (selectedFiles.length === 0) {
      this.fileListEl.innerHTML = `<span class="placeholder">${t.noFiles}</span>`;
      return;
    }

    this.fileListEl.innerHTML = `
      <div class="file-list">
        <div class="picker-header">
          <strong>${t.selectedCount(selectedFiles.length)}</strong>
          <button id="clear-files-button" class="link-button" type="button">${t.clearFiles}</button>
        </div>
        <ul>
          ${selectedFiles.map((path) => `<li>${escapeHtml(baseName(path))}</li>`).join("")}
        </ul>
      </div>
    `;

    this.fileListEl.querySelector(".picker-header .link-button")?.addEventListener("click", onClear);
  }

  public renderOutputFolder(outputDirectory: string, noFolderText: string, escapeHtml: (path: string) => string) {
    this.outputFolderEl.innerHTML = outputDirectory
      ? `<span>${escapeHtml(outputDirectory)}</span>`
      : `<span class="placeholder">${noFolderText}</span>`;
  }

  public renderLevelOptions(t: Translation, currentLevel: CompressionLevel) {
    const options = t.levelOptions;

    this.levelOptionsEl.innerHTML = (
      Object.entries(options) as Array<
        [CompressionLevel, { label: string; description: string }]
      >
    )
      .map(
        ([value, option]) => `
          <label class="level-card">
            <input type="radio" name="compression-level" value="${value}" ${
              currentLevel === value ? "checked" : ""
            } />
            <span class="level-copy">
              <strong>${option.label}</strong>
              <small>${option.description}</small>
            </span>
          </label>
        `
      )
      .join("");
  }

  public renderSummary(
    results: CompressionResponse[],
    failures: CompressionFailure[],
    t: Translation,
    outputDirectory: string,
    formatBytes: (b: number) => string,
    baseName: (p: string) => string,
    escapeHtml: (p: string) => string,
    onOpenFolder: () => void
  ) {
    const totalOriginal = results.reduce((sum, item) => sum + item.originalSizeBytes, 0);
    const totalCompressed = results.reduce((sum, item) => sum + item.compressedSizeBytes, 0);
    const reduction = totalOriginal === 0
      ? 0
      : (1 - totalCompressed / totalOriginal) * 100;

    this.resultEl.classList.remove("hidden");
    this.resultEl.innerHTML = `
      <article class="result-card">
        <h2>${t.summary}</h2>
        <dl>
          <div>
            <dt>${t.processed}</dt>
            <dd>${results.length}</dd>
          </div>
          <div>
            <dt>${t.originalTotal}</dt>
            <dd>${formatBytes(totalOriginal)}</dd>
          </div>
          <div>
            <dt>${t.finalTotal}</dt>
            <dd>${formatBytes(totalCompressed)}</dd>
          </div>
          <div>
            <dt>${t.reduction}</dt>
            <dd>${reduction.toFixed(1)}%</dd>
          </div>
          <div>
            <dt>${t.savedIn}</dt>
            <dd class="path">${escapeHtml(outputDirectory)}</dd>
          </div>
        </dl>
        <div class="result-actions">
          <button id="open-output-folder" class="secondary" type="button">${t.openFolder}</button>
        </div>
        <div class="result-list">
          ${results.map((result) => `
            <article class="result-item">
              <h3>${escapeHtml(baseName(result.inputPath))}</h3>
              <dl>
                <div>
                  <dt>${t.originalTotal}</dt>
                  <dd>${formatBytes(result.originalSizeBytes)}</dd>
                </div>
                <div>
                  <dt>${t.finalTotal}</dt>
                  <dd>${formatBytes(result.compressedSizeBytes)}</dd>
                </div>
                <div>
                  <dt>${t.reduction}</dt>
                  <dd>${result.reductionPercent.toFixed(1)}%</dd>
                </div>
                <div>
                  <dt>${t.savedIn}</dt>
                  <dd class="path">${escapeHtml(result.outputPath)}</dd>
                </div>
              </dl>
            </article>
          `).join("")}
          ${failures.map((failure) => `
            <article class="result-item">
              <h3>${escapeHtml(baseName(failure.inputPath))}</h3>
              <dl>
                <div>
                  <dt>${t.failedFiles}</dt>
                  <dd>${escapeHtml(failure.message)}</dd>
                </div>
                <div>
                  <dt>${t.savedIn}</dt>
                  <dd class="path">${escapeHtml(failure.outputPath)}</dd>
                </div>
              </dl>
            </article>
          `).join("")}
        </div>
      </article>
    `;

    this.resultEl.querySelector(".result-actions button")?.addEventListener("click", onOpenFolder);
  }

  public renderStaticText(
    t: Translation,
    appVersion: string,
    currentTheme: ThemeMode,
    currentLocale: Locale,
    sortedLocaleOptions: LocaleOption[],
    officialLinks: OfficialLinks,
    dependencies: readonly CuratedDependencyGroup[],
    appLicense: string,
    ghostscriptVersion: string | null,
    ghostscriptReady: boolean,
    ghostscriptInstallationLink: string | null,
    busy: boolean
  ) {
    document.title = t.appName;
    this.eyebrowEl.textContent = t.tagline;
    this.titleEl.textContent = t.title;
    this.introEl.textContent = t.intro;
    this.appearanceLabelEl.textContent = t.appearance;
    this.languageLabelEl.textContent = t.language;
    this.filesLabelEl.textContent = t.selectedFiles;
    this.folderLabelEl.textContent = t.outputFolder;
    this.levelsLegendEl.textContent = t.compressionLevel;
    this.progressLabelEl.textContent = t.progressLabel;
    this.selectInputButton.textContent = t.choosePdfs;
    this.selectOutputButton.textContent = t.chooseFolder;
    this.aboutButton.textContent = t.about;
    this.aboutTitleEl.textContent = t.aboutTitle;
    this.aboutCloseButton.textContent = t.close;
    this.aboutSummaryTitleEl.textContent = t.aboutSummary;
    this.aboutSummaryCopyEl.textContent = t.intro;
    this.aboutDetailsTitleEl.textContent = t.aboutDetails;
    this.aboutLinksTitleEl.textContent = t.aboutLinks;
    this.aboutDependenciesTitleEl.textContent = t.aboutDependencies;
    this.aboutCreatedLabelEl.textContent = t.createdBy;
    this.aboutVersionLabelEl.textContent = t.version;
    this.aboutVersionValueEl.textContent = appVersion;
    this.aboutLicenseLabelEl.textContent = t.license;
    this.aboutLicenseValueEl.textContent = appLicense;
    this.aboutGsLabelEl.textContent = t.ghostscriptVersion;
      this.aboutGsValueEl.textContent = ghostscriptVersion ?? t.aboutUnavailable;
      
      if (ghostscriptInstallationLink && !ghostscriptReady) {
        // Add download link to about dialog when Ghostscript is missing
        let downloadLink = this.aboutGsValueEl.querySelector('a');
        if (!downloadLink) {
          downloadLink = document.createElement('a');
          downloadLink.href = ghostscriptInstallationLink;
          downloadLink.textContent = t.ghostscriptMissingLink;
          downloadLink.target = '_blank';
          downloadLink.rel = 'noreferrer';
          this.aboutGsValueEl.appendChild(document.createElement('br'));
          this.aboutGsValueEl.appendChild(downloadLink);
        }
      } else {
        // Remove download link if Ghostscript is available or we're on other platforms
        const downloadLink = this.aboutGsValueEl.querySelector('a');
        if (downloadLink) {
          downloadLink.remove();
        }
      }
    this.aboutWebsiteLinkEl.textContent = t.website;
    this.aboutWebsiteLinkEl.href = officialLinks.website;
    this.aboutDonationLinkEl.textContent = t.donation;
    this.aboutDonationLinkEl.href = officialLinks.donation;
    this.aboutDependenciesListEl.innerHTML = dependencies
      .map((group) => `
        <li>
          <section class="about-dependency-group">
            <h4>${group.label}</h4>
            <ul>
              ${group.entries.map((dependency) => `
                <li>
                  <a href="${dependency.href}" target="_blank" rel="noreferrer">${dependency.name}</a>
                  <span> - ${dependency.role}</span>
                </li>
              `).join("")}
            </ul>
          </section>
        </li>
      `)
      .join("");

    this.themeSelect.options[0].textContent = t.system;
    this.themeSelect.options[1].textContent = t.light;
    this.themeSelect.options[2].textContent = t.dark;
    
    this.localeSelect.innerHTML = sortedLocaleOptions
      .map((option) => `<option value="${option.value}">${option.label}</option>`)
      .join("");
      
    this.themeSelect.value = currentTheme;
    this.localeSelect.value = currentLocale;

    if (busy) {
      this.compressButton.textContent = t.cancel;
      this.compressButton.classList.add("cancel");
      this.compressButton.disabled = false;
    } else {
      this.compressButton.textContent = t.compress;
      this.compressButton.classList.remove("cancel");
      this.compressButton.disabled = !ghostscriptReady;
    }

    if (!busy && this.statusEl.textContent.trim().length === 0) {
      this.setStatus(t.ready, "info");
    }
  }

  // Event getters
  public getThemeSelect() { return this.themeSelect; }
  public getLocaleSelect() { return this.localeSelect; }
  public getAboutButton() { return this.aboutButton; }
  public getAboutCloseButton() { return this.aboutCloseButton; }
  public getAboutDialog() { return this.aboutDialog; }
  public getAboutDonationLink() { return this.aboutDonationLinkEl; }
  public getAboutWebsiteLink() { return this.aboutWebsiteLinkEl; }
  public getSelectInputButton() { return this.selectInputButton; }
  public getSelectOutputButton() { return this.selectOutputButton; }
  public getCompressButton() { return this.compressButton; }
  public getLevelOptionsEl() { return this.levelOptionsEl; }
  public getResultEl() { return this.resultEl; }
  public getPanelEl() { return this.panelEl; }

  public setAboutGhostscriptValue(version: string | null, unavailableText: string) {
    this.aboutGsValueEl.textContent = version ?? unavailableText;
  }

  public hideResult() {
    this.resultEl.classList.add("hidden");
    this.resultEl.innerHTML = "";
  }
}
