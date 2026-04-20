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
    printf 'Erro: Comando "%s" não encontrado.\n' "$1" >&2
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
    printf 'Baixando %s...\n' "$(basename "$output")"
    curl -L "$url" -o "$output"
    chmod +x "$output"
  fi
}

# 1. Preparar ícones
mkdir -p "$ROOT_DIR/src-tauri/icons"
if has_command convert; then
  convert "$ROOT_DIR/images/ozemPDF.png" -resize 512x512 "$ROOT_DIR/src-tauri/icons/OzemPDF.png"
elif [[ -f "$ROOT_DIR/src-tauri/icons/OzemPDF.png" ]]; then
  printf 'Aviso: "convert" não encontrado. Reutilizando ícone existente em src-tauri/icons/OzemPDF.png.\n'
else
  printf 'Erro: Comando "convert" não encontrado e nenhum ícone pré-gerado disponível em src-tauri/icons/OzemPDF.png.\n' >&2
  exit 1
fi

# 2. Compilar binário
require_command node
require_command npm
npm run build
npx tauri build --no-bundle

# 3. Preparar ferramentas de deploy
download_tool "https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage" "$TOOLS_DIR/linuxdeploy"
download_tool "https://raw.githubusercontent.com/linuxdeploy/linuxdeploy-plugin-gtk/master/linuxdeploy-plugin-gtk.sh" "$TOOLS_DIR/linuxdeploy-plugin-gtk"

# 4. Configurar AppDir e Deploy
APPDIR="$ROOT_DIR/src-tauri/target/release/bundle/appimage/OzemPDF.AppDir"
export OUTPUT="$APPIMAGE_PATH"
export LD_LIBRARY_PATH="$ROOT_DIR/src-tauri/target/release"
export PATH="$TOOLS_DIR:$PATH" # Para o linuxdeploy encontrar o plugin gtk

printf 'Iniciando o empacotamento com linuxdeploy...\n'

rm -rf "$APPDIR"
mkdir -p "$APPDIR"
mkdir -p "$(dirname "$APPIMAGE_PATH")"

# Copia metadados AppStream manualmente (importante para lojas de apps e Linux moderno)
mkdir -p "$APPDIR/usr/share/metainfo"
cp "$ROOT_DIR/src-tauri/linux/net.pedropaulo.OzemPDF.metainfo.xml" "$APPDIR/usr/share/metainfo/${APP_ID}.metainfo.xml"

# Executa o linuxdeploy
# --appdir: pasta onde a estrutura do app é montada
# --plugin gtk: garante que as libs de interface e temas sejam incluídas
# --icon-filename: garante que o ícone tenha o nome esperado pelo .desktop
ARCH=x86_64 "$TOOLS_DIR/linuxdeploy" --appimage-extract-and-run \
  --appdir "$APPDIR" \
  --executable "$BINARY_PATH" \
  --icon-file "$ROOT_DIR/src-tauri/icons/OzemPDF.png" \
  --icon-filename "${APP_ID}" \
  --desktop-file "$ROOT_DIR/src-tauri/linux/net.pedropaulo.OzemPDF.desktop" \
  --plugin gtk \
  --output appimage

printf '\n%s\n' "--------------------------------------------------------"
printf 'AppImage portátil pronto em: %s\n' "$APPIMAGE_PATH"
printf 'As bibliotecas (WebKit, GTK) agora estão dentro do arquivo.\n'
printf 'Nota: O Ghostscript ainda é necessário no sistema de destino.\n'
printf '%s\n' "--------------------------------------------------------"
