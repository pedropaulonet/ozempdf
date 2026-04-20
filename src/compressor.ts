import { invoke } from "@tauri-apps/api/core";
import { type CompressionLevel } from "./translations";

export type CompressionRequest = {
  inputPath: string;
  outputPath: string;
  level: CompressionLevel;
};

export type CompressionResponse = {
  inputPath: string;
  outputPath: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercent: number;
  preset: string;
};

export type CompressionFailure = {
  inputPath: string;
  outputPath: string;
  message: string;
};

export type SystemStatus = {
  ghostscriptAvailable: boolean;
  ghostscriptVersion: string | null;
  ghostscriptError: string | null;
};

export class PDFCompressor {
  private busy = false;
  private cancelRequested = false;

  public isBusy(): boolean {
    return this.busy;
  }

  public requestCancel() {
    this.cancelRequested = true;
  }

  public resetCancel() {
    this.cancelRequested = false;
  }

  public isCancelRequested(): boolean {
    return this.cancelRequested;
  }

  public async getSystemStatus(): Promise<SystemStatus> {
    return await invoke<SystemStatus>("get_system_status");
  }

  public async openExternalLink(url: string): Promise<void> {
    await invoke("open_external_link", { url });
  }

  public async compressSingle(request: CompressionRequest): Promise<CompressionResponse> {
    return await invoke<CompressionResponse>("compress_pdf", { request });
  }

  public async compressBatch(
    files: string[],
    _outputDirectory: string,
    level: CompressionLevel,
    onProgress: (index: number, currentFile: string) => void,
    baseName: (path: string) => string,
    makeOutputPath: (input: string) => string
  ): Promise<{ results: CompressionResponse[]; failures: CompressionFailure[] }> {
    const results: CompressionResponse[] = [];
    const failures: CompressionFailure[] = [];
    this.busy = true;
    this.cancelRequested = false;

    for (const [index, inputPath] of files.entries()) {
      if (this.cancelRequested) {
        break;
      }

      const currentName = baseName(inputPath);
      const outputPath = makeOutputPath(inputPath);

      onProgress(index, currentName);

      try {
        const response = await this.compressSingle({
          inputPath,
          outputPath,
          level
        });
        results.push(response);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push({ inputPath, outputPath, message });
      }

      onProgress(index + 1, currentName);
    }

    this.busy = false;
    return { results, failures };
  }
}
