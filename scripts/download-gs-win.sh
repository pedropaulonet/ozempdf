#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GS_WIN_DIR="$ROOT_DIR/src-tauri/gs-win"
GS_VERSION="10.05.0"
GS_ZIP_URL="https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs${GS_VERSION//./}/gs${GS_VERSION//./_}w64.zip"
GS_ZIP_FILE="/tmp/gs_${GS_VERSION}_win64.zip"

if [[ -f "$GS_WIN_DIR/gswin64c.exe" ]]; then
  printf 'Ghostscript %s already present in %s\n' "$GS_VERSION" "$GS_WIN_DIR"
  exit 0
fi

printf 'Downloading Ghostscript %s for Windows...\n' "$GS_VERSION"
curl -L "$GS_ZIP_URL" -o "$GS_ZIP_FILE"

EXTRACT_DIR="/tmp/gs_${GS_VERSION}_win64"
rm -rf "$EXTRACT_DIR"
mkdir -p "$EXTRACT_DIR"
unzip -q -o "$GS_ZIP_FILE" -d "$EXTRACT_DIR"

printf 'Organizing Ghostscript files into %s\n' "$GS_WIN_DIR"
mkdir -p "$GS_WIN_DIR"

GS_INNER="$EXTRACT_DIR/gs${GS_VERSION//./_}/bin"
if [[ ! -d "$GS_INNER" ]]; then
  GS_INNER=$(find "$EXTRACT_DIR" -name "gswin64c.exe" -exec dirname {} \; | head -1)
fi

if [[ -z "$GS_INNER" || ! -d "$GS_INNER" ]]; then
  printf 'Error: could not find Ghostscript binaries in extracted archive.\n' >&2
  exit 1
fi

cp "$GS_INNER/gswin64c.exe" "$GS_WIN_DIR/"
cp "$GS_INNER/gsdll64.dll" "$GS_WIN_DIR/"

LIB_DIR=$(dirname "$GS_INNER")/lib
RESOURCE_DIR=$(dirname "$GS_INNER")/Resource

if [[ -d "$LIB_DIR" ]]; then
  cp -r "$LIB_DIR" "$GS_WIN_DIR/"
fi

if [[ -d "$RESOURCE_DIR" ]]; then
  cp -r "$RESOURCE_DIR" "$GS_WIN_DIR/"
fi

rm -rf "$EXTRACT_DIR" "$GS_ZIP_FILE"

printf '\n%s\n' "--------------------------------------------------------"
printf 'Ghostscript %s for Windows ready at: %s\n' "$GS_VERSION" "$GS_WIN_DIR"
printf 'Run `npm run tauri:build` to build the Windows installer.\n'
printf '%s\n' "--------------------------------------------------------"