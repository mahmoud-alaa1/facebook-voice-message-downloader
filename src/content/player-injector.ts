/**
 * Player Injector
 * Injects a download button into a single voice message player.
 * One instance per player — double-injection prevented via ATTR.INJECTED guard.
 */

import { DOWNLOAD_BUTTON_ICON_SVG } from "@utils/constants";
import { DomHelpers } from "@utils/dom-helpers";
import {
  downloadBlobUrl,
  generateVoiceMessageFilename,
} from "@utils/download-helpers";
import { Messages } from "@messaging/contract";
import { loggers } from "@utils/logger";
import { DownloadResponse } from "@messaging/responses";

const logger = loggers.injector;

export class PlayerInjector {
  private readonly elementId: string;
  private readonly durationMs: number;

  constructor(private readonly root: HTMLElement) {
    this.elementId = `vm-${Math.random().toString(36).substring(2, 11)}`;
    this.durationMs = DomHelpers.readPlayerDurationMs(root);

    DomHelpers.markAsInjected(root, this.elementId);
    Messages.registerElement({
      elementId: this.elementId,
      durationMs: this.durationMs,
    });
    this.injectUI();
  }

  private injectUI(): void {
    const button = DomHelpers.createDownloadButton(DOWNLOAD_BUTTON_ICON_SVG);
    const container = DomHelpers.createContainer(button);
    DomHelpers.insertContainerAfterPlayer(this.root, container);
    button.addEventListener("click", () => this.handleDownloadClick(button));
  }

  private handleDownloadClick(button: HTMLButtonElement): void {
    button.disabled = true;
    button.style.opacity = "0.5";

    Messages.requestDownload(
      { elementId: this.elementId },
      (response: DownloadResponse) => {
        button.disabled = false;
        button.style.opacity = "1";
        this.handleDownloadResponse(response);
      },
    );
  }

  private handleDownloadResponse(response: DownloadResponse): void {
    if (chrome.runtime.lastError) {
      logger.error("Runtime error: " + chrome.runtime.lastError.message);
      return;
    }

    if (!response?.success) {
      logger.warn("Download failed: " + (response?.error ?? "Unknown error"));
      return;
    }

    if (response.isBlob && response.url) {
      const filename = generateVoiceMessageFilename(response.blobType);
      downloadBlobUrl(response.url, filename)
        .then(() => logger.info("Blob downloaded successfully"))
        .catch((err) => logger.error("Blob download failed: " + err));
      return;
    }

    logger.info(
      "Network download initiated: " + (response.downloadId ?? "unknown"),
    );
  }
}
