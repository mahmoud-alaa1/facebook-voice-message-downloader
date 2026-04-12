// content/blob-bridge.ts
import { loggers } from "@utils/logger";

const logger = loggers.content;

function onBlobUrlDetected(event: MessageEvent): void {
  if (event.source !== window || event.data?.source !== "FB_VOICE_DOWNLOADER") {
    return;
  }

  if (event.data.action === "blobUrlDetected") {
    const { blobUrl, blobType, durationMs, blobIndex, blobData } = event.data;

    // Recreate blob from raw bytes — this URL belongs to us, not Facebook
    let safeUrl = blobUrl;
    if (blobData instanceof ArrayBuffer) {
      const blob = new Blob([blobData], { type: blobType });
      safeUrl = URL.createObjectURL(blob);
    }

    chrome.runtime.sendMessage({
      action: "registerAudioUrl",
      url: safeUrl,
      durationMs,
      blobIndex,
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
