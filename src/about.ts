export type OfficialLinks = {
  donation: string;
  website: string;
};

export type CuratedDependency = {
  name: string;
  href: string;
  role: string;
};

export type CuratedDependencyGroup = {
  label: string;
  entries: CuratedDependency[];
};

export const OFFICIAL_LINKS: OfficialLinks = {
  donation: "https://ko-fi.com/pedropaulo",
  website: "https://dev.pedropaulo.net/ozempdf"
};

export const CURATED_DEPENDENCIES: CuratedDependencyGroup[] = [
  {
    label: "Core app",
    entries: [
      {
        name: "Tauri",
        href: "https://tauri.app",
        role: "desktop runtime and native window shell"
      },
      {
        name: "Rust",
        href: "https://www.rust-lang.org",
        role: "backend command layer and native release binary"
      },
      {
        name: "TypeScript",
        href: "https://www.typescriptlang.org",
        role: "typed frontend logic for the app interface"
      },
      {
        name: "@tauri-apps/plugin-dialog",
        href: "https://v2.tauri.app/plugin/dialog/",
        role: "native file and folder pickers for PDF workflows"
      },
      {
        name: "open",
        href: "https://github.com/Byron/open-rs",
        role: "cross-platform URL and file opener"
      }
    ]
  },
  {
    label: "PDF engine",
    entries: [
      {
        name: "Ghostscript",
        href: "https://ghostscript.com",
        role: "PDF compression engine used for output generation"
      }
    ]
  },
  {
    label: "QA/build",
    entries: [
      {
        name: "Vite",
        href: "https://vite.dev",
        role: "frontend build pipeline and development tooling"
      },
      {
        name: "Vitest",
        href: "https://vitest.dev",
        role: "test runner covering UI behavior and regressions"
      }
    ]
  }
];

export const APP_LICENSE = "MIT";
