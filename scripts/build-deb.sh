#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(node -p "require('$ROOT_DIR/package.json').version")"
APP_ID="net.pedropaulo.OzemPDF"
BINARY_PATH="$ROOT_DIR/src-tauri/target/release/ozempdf"
DEB_NAME="ozempdf_${VERSION}_amd64.deb"
DEB_DIR="$ROOT_DIR/src-tauri/target/release/bundle/deb/ozempdf_${VERSION}_amd64"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Error: command "%s" not found.\n' "$1" >&2
    exit 1
  fi
}

# 1. Build frontend and Rust binary
require_command node
require_command npm
require_command cargo
require_command dpkg-deb

npm run build
cd "$ROOT_DIR/src-tauri" && cargo build --release

if [[ ! -f "$BINARY_PATH" ]]; then
  printf 'Error: binary not found at %s\n' "$BINARY_PATH" >&2
  exit 1
fi

# 2. Create deb directory structure
rm -rf "$DEB_DIR"
mkdir -p "$DEB_DIR/DEBIAN"
mkdir -p "$DEB_DIR/usr/bin"
mkdir -p "$DEB_DIR/usr/share/applications"
mkdir -p "$DEB_DIR/usr/share/metainfo"
mkdir -p "$DEB_DIR/usr/share/icons/hicolor/scalable/apps"
mkdir -p "$DEB_DIR/usr/share/icons/hicolor/128x128/apps"
mkdir -p "$DEB_DIR/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$DEB_DIR/usr/share/icons/hicolor/32x32/apps"

# 3. Install files
install -Dm755 "$BINARY_PATH" "$DEB_DIR/usr/bin/ozempdf"
install -Dm644 "$ROOT_DIR/src-tauri/linux/net.pedropaulo.OzemPDF.desktop" "$DEB_DIR/usr/share/applications/net.pedropaulo.OzemPDF.desktop"
install -Dm644 "$ROOT_DIR/src-tauri/linux/net.pedropaulo.OzemPDF.metainfo.xml" "$DEB_DIR/usr/share/metainfo/net.pedropaulo.OzemPDF.metainfo.xml"
install -Dm644 "$ROOT_DIR/images/ozemPDF.svg" "$DEB_DIR/usr/share/icons/hicolor/scalable/apps/net.pedropaulo.OzemPDF.svg"
install -Dm644 "$ROOT_DIR/src-tauri/icons/128x128.png" "$DEB_DIR/usr/share/icons/hicolor/128x128/apps/net.pedropaulo.OzemPDF.png"
install -Dm644 "$ROOT_DIR/src-tauri/icons/128x128@2x.png" "$DEB_DIR/usr/share/icons/hicolor/256x256/apps/net.pedropaulo.OzemPDF.png"
install -Dm644 "$ROOT_DIR/src-tauri/icons/32x32.png" "$DEB_DIR/usr/share/icons/hicolor/32x32/apps/net.pedropaulo.OzemPDF.png"

# 4. Create control file
cat > "$DEB_DIR/DEBIAN/control" << EOF
Package: ozempdf
Version: ${VERSION}
Section: office
Priority: optional
Architecture: amd64
Depends: ghostscript, libwebkit2gtk-4.1-0, libgtk-3-0t64
Maintainer: Pedro Paulo <pedro@pedropaulo.net>
Description: Desktop PDF compressor with practical presets and batch workflow
 OzemPDF compresses one or many PDF files using Ghostscript presets
 (Maximum, High, Balanced, Quality) with native file dialogs, drag-and-drop
 support, batch processing, and light/dark/system themes.
Homepage: https://dev.pedropaulo.net/ozempdf
License: MIT
EOF

# 5. Build .deb
dpkg-deb --build "$DEB_DIR" "$ROOT_DIR/${DEB_NAME}"

printf '\n%s\n' "--------------------------------------------------------"
printf 'Debian package ready at: %s\n' "$ROOT_DIR/${DEB_NAME}"
printf 'Install with: sudo dpkg -i %s\n' "$DEB_NAME"
printf 'Note: Ensure ghostscript is available in PATH.\n'
printf '%s\n' "--------------------------------------------------------"