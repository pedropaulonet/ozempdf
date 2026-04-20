export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function baseName(path: string) {
  const segments = path.split(/[/\\]/);
  return segments[segments.length - 1] || path;
}

export function joinPath(directory: string, filename: string) {
  const separator = directory.includes("\\") ? "\\" : "/";
  return `${directory}${directory.endsWith(separator) ? "" : separator}${filename}`;
}

export function makeOutputPath(inputPath: string, outputDirectory: string) {
  const filename = baseName(inputPath).replace(/\.pdf$/i, "-compressed.pdf");
  return joinPath(outputDirectory, filename);
}

export function normalizeLocale(locale: string): string {
  const lower = locale.toLowerCase();

  if (lower.startsWith("pt")) return "pt-BR";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("it")) return "it";

  return "en";
}