import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  formatBytes,
  baseName,
  joinPath,
  makeOutputPath
} from "./utils";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("returns the same string when there is nothing to escape", () => {
    expect(escapeHtml("plain text")).toBe("plain text");
  });

  it("escapes a path with mixed characters", () => {
    expect(escapeHtml("C:\\Users<admin>&file's")).toBe(
      "C:\\Users&lt;admin&gt;&amp;file&#39;s"
    );
  });
});

describe("formatBytes", () => {
  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formats kilobytes with one decimal", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats kilobytes without decimal when >= 10", () => {
    expect(formatBytes(15360)).toBe("15 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1.0 MB");
  });

  it("formats zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats large megabytes without decimal", () => {
    expect(formatBytes(52428800)).toBe("50 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1.0 GB");
  });
});

describe("baseName", () => {
  it("extracts filename from unix path", () => {
    expect(baseName("/home/user/report.pdf")).toBe("report.pdf");
  });

  it("extracts filename from windows path", () => {
    expect(baseName("C:\\Users\\admin\\file.pdf")).toBe("file.pdf");
  });

  it("returns the string when there are no separators", () => {
    expect(baseName("report.pdf")).toBe("report.pdf");
  });
});

describe("joinPath", () => {
  it("joins unix path segments", () => {
    expect(joinPath("/home/user", "output.pdf")).toBe("/home/user/output.pdf");
  });

  it("joins unix path without adding duplicate separator", () => {
    expect(joinPath("/home/user/", "output.pdf")).toBe("/home/user/output.pdf");
  });

  it("joins windows path segments", () => {
    expect(joinPath("C:\\Users\\admin", "output.pdf")).toBe("C:\\Users\\admin\\output.pdf");
  });

  it("joins windows path without adding duplicate separator", () => {
    expect(joinPath("C:\\Users\\admin\\", "output.pdf")).toBe("C:\\Users\\admin\\output.pdf");
  });
});

describe("makeOutputPath", () => {
  it("replaces .pdf with -compressed.pdf in the filename", () => {
    expect(makeOutputPath("/home/user/document.pdf", "/tmp/out")).toBe(
      "/tmp/out/document-compressed.pdf"
    );
  });

  it("handles uppercase .PDF extension", () => {
    expect(makeOutputPath("/home/user/DOC.PDF", "/tmp/out")).toBe(
      "/tmp/out/DOC-compressed.pdf"
    );
  });

  it("preserves directory structure in the input path", () => {
    expect(makeOutputPath("/home/user/nested/folder/report.pdf", "/output")).toBe(
      "/output/report-compressed.pdf"
    );
  });
});