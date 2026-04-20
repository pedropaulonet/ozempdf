#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_ID="net.pedropaulo.OzemPDF"

fix_deb() {
  local deb_dir="$ROOT_DIR/src-tauri/target/release/bundle/deb"
  local deb_file
  deb_file=$(find "$deb_dir" -maxdepth 1 -name "*.deb" | head -1)

  if [[ -z "$deb_file" ]]; then
    echo "fix-deb: no .deb found, skipping"
    return 0
  fi

  local temp
  temp=$(mktemp -d)
  dpkg-deb -R "$deb_file" "$temp"

  rm -f "$temp/usr/share/applications/OzemPDF.desktop"
  cp "$ROOT_DIR/src-tauri/linux/$APP_ID.desktop" "$temp/usr/share/applications/"

  mkdir -p "$temp/usr/share/metainfo"
  cp "$ROOT_DIR/src-tauri/linux/$APP_ID.metainfo.xml" "$temp/usr/share/metainfo/"

  mkdir -p "$temp/usr/share/icons/hicolor/scalable/apps"
  cp "$ROOT_DIR/src-tauri/icons/ozemPDF.svg" "$temp/usr/share/icons/hicolor/scalable/apps/$APP_ID.svg"

  if [[ -d "$temp/usr/share/icons/hicolor/256x256@2" ]]; then
    mkdir -p "$temp/usr/share/icons/hicolor/256x256/apps"
    cp "$temp/usr/share/icons/hicolor/256x256@2/apps/"*.png "$temp/usr/share/icons/hicolor/256x256/apps/"
    rm -rf "$temp/usr/share/icons/hicolor/256x256@2"
  fi

  for size_dir in "$temp/usr/share/icons/hicolor"/*/apps; do
    if [[ -f "$size_dir/ozempdf.png" ]]; then
      mv "$size_dir/ozempdf.png" "$size_dir/$APP_ID.png"
    fi
  done

  dpkg-deb --build "$temp" "$deb_file"
  rm -rf "$temp"
  echo "fix-deb: patched $deb_file"
}

fix_deb