#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GS_WIN_DIR="$ROOT_DIR/src-tauri/gs-win"
GS_VERSION="10.05.1"
GS_TAG="gs10051"
GS_URL="https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/${GS_TAG}/gs${GS_VERSION//./}w64.exe"
GS_EXE_FILE="/tmp/gs_${GS_VERSION}_win64.exe"
EXTRACT_DIR="/tmp/gs_${GS_VERSION}_extracted"

if [[ -f "$GS_WIN_DIR/bin/gswin64c.exe" ]]; then
  printf 'Ghostscript %s already present in %s\n' "$GS_VERSION" "$GS_WIN_DIR"
  exit 0
fi

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Error: command "%s" not found.\n' "$1" >&2
    exit 1
  fi
}

require_command curl
require_command 7z

printf 'Downloading Ghostscript %s for Windows...\n' "$GS_VERSION"
curl -L "$GS_URL" -o "$GS_EXE_FILE" --silent --show-error

printf 'Extracting Ghostscript from NSIS installer...\n'
rm -rf "$EXTRACT_DIR"
mkdir -p "$EXTRACT_DIR"
7z x "$GS_EXE_FILE" -o"$EXTRACT_DIR" -y > /dev/null

printf 'Copying Ghostscript files to %s\n' "$GS_WIN_DIR"
mkdir -p "$GS_WIN_DIR/bin"
mkdir -p "$GS_WIN_DIR/lib"
mkdir -p "$GS_WIN_DIR/Resource"

cp "$EXTRACT_DIR/bin/gswin64c.exe" "$GS_WIN_DIR/bin/"
cp "$EXTRACT_DIR/bin/gsdll64.dll" "$GS_WIN_DIR/bin/"

if [[ -d "$EXTRACT_DIR/lib" ]]; then
  cp -r "$EXTRACT_DIR/lib/"* "$GS_WIN_DIR/lib/"
fi

if [[ -d "$EXTRACT_DIR/Resource" ]]; then
  cp -r "$EXTRACT_DIR/Resource/"* "$GS_WIN_DIR/Resource/"
fi

rm -rf "$EXTRACT_DIR" "$GS_EXE_FILE"

printf '\n%s\n' "--------------------------------------------------------"
printf 'Ghostscript %s for Windows ready at: %s\n' "$GS_VERSION" "$GS_WIN_DIR"
printf 'Run `npm run tauri:build` to build the Windows installer.\n'
printf '%s\n' "--------------------------------------------------------"