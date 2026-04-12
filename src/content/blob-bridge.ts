// content/blob-bridge.ts
import { loggers } from "@utils/logger";

const logger = loggers.content;

function onBlobUrlDetected(event: MessageEvent): void {
  if (event.source !== window || event.data?.source !== "FB_VOICE_DOWNLOADER") {
    return;
  }

  if (event.data.action === "blobUrlDetected") {
    chrome.runtime.sendMessage({
      action: "registerAudioUrl",
      url: event.data.blobUrl,
      durationMs: event.data.durationMs,
      blobIndex: event.data.blobIndex,
      lastModified: null,
    });
  }
}

/**
 * Initializes the blob bridge by setting up a message listener to receive blob URL data from the main world (Facebook's scripts) to the isolated world (the content script). This allows the extension to capture audio blob URLs created by Facebook and request downloads for them.
 */
export function initializeBlobBridge(): void {
  window.addEventListener("message", onBlobUrlDetected);
  logger.info("Blob bridge initialized");
}
