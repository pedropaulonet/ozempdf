# OzemPDF

OzemPDF is a beta desktop app for compressing one PDF or a whole batch with a simple interface, practical presets, and native file dialogs.

It is built with Tauri for a lightweight desktop footprint while keeping Ghostscript behind an approachable UI for everyday PDF size reduction.

Ghostscript is currently a required system dependency: OzemPDF expects the `gs` command to be installed and available in `PATH`.

![OzemPDF logo](./images/ozemPDF.svg)

## Supported Platforms

- Linux is the current beta target, with active packaging work for AppImage and local Flatpak builds.
- Windows and macOS builds are not available in this beta yet.

## Why OzemPDF

- Compress one or many PDFs without using a command line.
- Pick a compression preset based on size or quality goals.
- Send output to a chosen folder and keep processing even if one file fails.
- Avoid silent overwrites by generating unique output filenames.
- Use a desktop UI with theme and language controls.

## Features

- Batch PDF compression powered by Ghostscript
- Four compression presets: Maximum, High, Balanced, and Quality
- Output folder picker with direct access to the result location
- Progress feedback and final batch summary
- Resilient batch handling when individual files fail
- Unique output naming to prevent accidental replacement
- Light, dark, and system theme support
- Localized interface with About dialog details, including detected Ghostscript version

## Beta Status

OzemPDF is currently in `0.1.0-beta.2`. The app is usable, but packaging and store distribution are still being refined.

## Getting OzemPDF

- GitHub users can currently use OzemPDF by building it from this repository or by creating the Linux AppImage locally with `npm run tauri:appimage`.
- Release downloads and store distribution are not live yet, and Windows/macOS packages are not available in the current beta.

## Requirements

### Runtime

- `ghostscript` must be installed and available in `PATH` as `gs`
- Linux AppImage builds bundle the required WebKit/GTK libraries; some distributions may still need `libfuse2` to launch the AppImage directly

Example for Debian or Ubuntu:

```bash
sudo apt update
sudo apt install ghostscript libfuse2
```

### Local development and builds

- Node.js 20+
- Rust with `cargo`
- Ghostscript available as `gs`
- Linux-native Tauri prerequisites for `npm run tauri:dev` and `npm run tauri:build` (GTK3, WebKitGTK, and common build extras)
- ImageMagick with `convert` for the AppImage script
- `curl` for the AppImage script to download `linuxdeploy` tooling on demand

Example for Debian or Ubuntu:

```bash
sudo apt update
sudo apt install build-essential pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev ghostscript imagemagick curl
```

## Run Locally

```bash
npm install
npm run tauri:dev
```

## Build

```bash
npm install
npm run tauri:build
```

This uses the current Tauri production build pipeline from `package.json`.

## AppImage

Build the Linux AppImage with:

```bash
npm run tauri:appimage
```

The script in `scripts/build-appimage.sh` rebuilds the frontend, compiles the Tauri binary, prepares Linux metadata, bundles the required WebKit/GTK libraries, and packages the portable AppImage. The generated AppImage still expects Ghostscript to be installed on the target system and may require `libfuse2` on distributions that do not provide compatible FUSE support by default.

## Tech Stack

- Tauri
- TypeScript
- Vite
- Vitest
- Rust
- Ghostscript
- Flatpak manifest tooling

## Official Links

- Website: https://dev.pedropaulo.net/ozempdf
- Source code: https://github.com/ppgm/ozempdf
- Sponsor: https://ko-fi.com/pedropaulo

## License

MIT. See `LICENSE`.
