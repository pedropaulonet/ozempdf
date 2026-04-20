#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(node -p "require('$ROOT_DIR/package.json').version")"
BINARY_PATH="$ROOT_DIR/src-tauri/target/release/ozempdf"
APP_ID="net.pedropaulo.OzemPDF"
APPIMAGE_PATH="$ROOT_DIR/src-tauri/target/release/bundle/appimage/OzemPDF_${VERSION}_amd64.AppImage"
TOOLS_DIR="$ROOT_DIR/tools"

mkdir -p "$TOOLS_DIR"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Error: command "%s" not found.\n' "$1" >&2
    exit 1
  fi
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

download_tool() {
  local url="$1"
  local output="$2"
  if [[ ! -f "$output" ]]; then
    printf 'Downloading %s...\n' "$(basename "$output")"
    curl -L "$url" -o "$output"
    chmod +x "$output"
  fi
}

# 1. Prepare icons
mkdir -p "$ROOT_DIR/src-tauri/icons"
if has_command convert; then
  convert "$ROOT_DIR/images/ozemPDF.png" -resize 512x512 "$ROOT_DIR/src-tauri/icons/OzemPDF.png"
elif [[ -f "$ROOT_DIR/src-tauri/icons/OzemPDF.png" ]]; then
  printf 'Warning: "convert" not found. Reusing existing icon at src-tauri/icons/OzemPDF.png.\n'
else
  printf 'Error: "convert" not found and no pre-generated icon available at src-tauri/icons/OzemPDF.png.\n' >&2
  exit 1
fi

# 2. Build binary
require_command node
require_command npm
npm run build
npx tauri build --no-bundle

# 3. Prepare deploy tools
download_tool "https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage" "$TOOLS_DIR/linuxdeploy"
download_tool "https://raw.githubusercontent.com/linuxdeploy/linuxdeploy-plugin-gtk/master/linuxdeploy-plugin-gtk.sh" "$TOOLS_DIR/linuxdeploy-plugin-gtk"

# 4. Set up AppDir and deploy
APPDIR="$ROOT_DIR/src-tauri/target/release/bundle/appimage/OzemPDF.AppDir"
export OUTPUT="$APPIMAGE_PATH"
export LD_LIBRARY_PATH="$ROOT_DIR/src-tauri/target/release"
export PATH="$TOOLS_DIR:$PATH"

printf 'Starting AppImage packaging with linuxdeploy...\n'

rm -rf "$APPDIR"
mkdir -p "$APPDIR"
mkdir -p "$(dirname "$APPIMAGE_PATH")"

# Copy AppStream metadata manually (important for app stores and modern Linux)
mkdir -p "$APPDIR/usr/share/metainfo"
cp "$ROOT_DIR/src-tauri/linux/net.pedropaulo.OzemPDF.metainfo.xml" "$APPDIR/usr/share/metainfo/${APP_ID}.metainfo.xml"

# Run linuxdeploy
ARCH=x86_64 "$TOOLS_DIR/linuxdeploy" --appimage-extract-and-run \
  --appdir "$APPDIR" \
  --executable "$BINARY_PATH" \
  --icon-file "$ROOT_DIR/src-tauri/icons/OzemPDF.png" \
  --icon-filename "${APP_ID}" \
  --desktop-file "$ROOT_DIR/src-tauri/linux/net.pedropaulo.OzemPDF.desktop" \
  --plugin gtk \
  --output appimage

printf '\n%s\n' "--------------------------------------------------------"
printf 'AppImage ready at: %s\n' "$APPIMAGE_PATH"
printf 'WebKit and GTK libraries are bundled inside.\n'
printf 'Note: Ghostscript must still be installed on the target system.\n'
printf '%s\n' "--------------------------------------------------------"