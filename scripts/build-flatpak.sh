#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_ID="net.pedropaulo.OzemPDF"
MANIFEST="$ROOT_DIR/${APP_ID}.yml"
BUILD_DIR="$ROOT_DIR/build-dir"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Error: command "%s" not found.\n' "$1" >&2
    exit 1
  fi
}

require_command flatpak-builder

# 1. Ensure required runtimes and SDKs are installed
printf 'Installing required Flatpak runtimes and SDKs...\n'
flatpak install -y flathub org.freedesktop.Platform//24.08 \
  org.freedesktop.Sdk//24.08 \
  org.freedesktop.Sdk.Extension.node20//24.08 \
  org.freedesktop.Sdk.Extension.rust-stable//24.08

# 2. Build the Flatpak
printf 'Building Flatpak from manifest: %s\n' "$MANIFEST"

flatpak-builder \
  --user \
  --install \
  --force-clean \
  "$BUILD_DIR" \
  "$MANIFEST"

printf '\n%s\n' "--------------------------------------------------------"
printf 'Flatpak built and installed locally.\n'
printf 'Run with: flatpak run %s\n' "$APP_ID"
printf 'Uninstall with: flatpak uninstall %s\n' "$APP_ID"
printf '%s\n' "--------------------------------------------------------"