# AGENTS.md

## Build & Run

```bash
npm install
npm run tauri:dev
```

## Commands

- `npm run build` — TypeScript check + Vite production build
- `npm run tauri:dev` — Start Tauri dev server (frontend + Rust backend)
- `npm run tauri:build` — Production build (generates binary in src-tauri/target/release/)
- `npm run test` — Run Vitest frontend test suite
- `cd src-tauri && cargo test` — Run Rust unit tests (requires system deps)
- `cd src-tauri && cargo check` — Check Rust compilation without full build

## System Dependencies (Linux)

```bash
sudo apt install build-essential pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev ghostscript
```

## Project Structure

- `src/` — TypeScript frontend (Vite)
  - `main.ts` — App entry point, event handlers, state
  - `ui.ts` — UIManager class (DOM rendering)
  - `compressor.ts` — Tauri IPC client
  - `translations.ts` — i18n (6 locales)
  - `about.ts` — About dialog metadata
  - `styles.css` — All CSS with dark/light/system themes
  - `main.test.ts` — Vitest tests
- `src-tauri/` — Rust backend (Tauri)
  - `src/lib.rs` — Commands: compress_pdf, get_system_status, open_external_link
  - `src/main.rs` — Entry point
  - `tauri.conf.json` — Tauri config
  - `capabilities/default.json` — Permission config
- `images/` — Logo assets (SVG + PNG)

## Notes

- Ghostscript (`gs`) must be available in PATH at runtime for PDF compression
- Frontend tests use jsdom environment with Tauri API mocks
- Rust tests that call `gs` or touch the filesystem are gated behind `#[cfg(test)]`