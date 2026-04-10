/**
 * Download handling utilities
 */

import { getAudioFileExtension } from "./audio-helpers";

/**
 * Download a blob URL using native browser download mechanism
 */
export function downloadBlobUrl(
  blobUrl: string,
  filename: string,
): Promise<void> {
  return new Promise((resolve) => {
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = blobUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    // Clean up after a short delay to ensure the download starts
    setTimeout(() => {
      document.body.removeChild(link);
      resolve();
    }, 100);
  });
}

/**
 * Generate a standard voice message filename
 */
export function generateVoiceMessageFilename(
  mimeType?: string,
  timestamp: number = Date.now(),
): string {
  const ext = mimeType ? getAudioFileExtension(mimeType) : "mp4";
  return `voice-message-${timestamp}.${ext}`;
}

/**
 * Request browser download via chrome.downloads API (for network URLs)
 */
export function downloadNetworkUrl(
  url: string,
  filename: string,
): Promise<number> {
  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      { url, filename, saveAs: false },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(downloadId);
        }
      },
    );
  });
}
