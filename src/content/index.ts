/**
 * Content Script Entry Point
 *
 * Coordinates initialization of all content script features:
 * 1. Blob URL interception (main world injection)
 * 2. Audio URL analysis
 * 3. Player DOM scanning and button injection
 */

import { initializeAudioAnalyzer } from "./audio-analyzer";
import { PlayerScanner } from "./player-scanner";
import { loggers } from "@utils/logger";
import interceptorUrl from "./blob-interceptor?script";

const logger = loggers.content;

/**
 * Inject blob interceptor into main world
 */
function injectBlobInterceptor(): void {
  try {
    // Use the Vite-compiled script URL.
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(interceptorUrl);

    script.onload = () => {
      script.remove();
      logger.info("Blob interceptor injected");
    };

    script.onerror = () => {
      logger.error("Failed to load blob interceptor script");
      script.remove();
    };

    (document.head || document.documentElement).appendChild(script);

    window.addEventListener("message", (event) => {
      if (
        event.source !== window ||
        event.data?.source !== "FB_VOICE_DOWNLOADER"
      ) {
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
    });
  } catch (error) {
    logger.error(
      "Blob interceptor injection error: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}

/**
 * Initialize content script
 */
function initialize(): void {
  logger.info("Content script initializing...");

  // Step 1: Inject blob interceptor
  injectBlobInterceptor();

  // Step 2: Initialize audio analyzer for network URLs
  initializeAudioAnalyzer();

  // Step 3: Start scanning DOM for players and injecting buttons
  new PlayerScanner();

  logger.info("Content script ready");
}

// Start initialization
initialize();
