/**
 * Audio URL analyzer
 * Receives intercepted URLs and calculates their duration
 */
import { AnalyzeAudioUrlMessage } from "@protocol/background-to-content";
import { AudioAnalysisResponse } from "@protocol/responses";
import { getAudioDuration } from "@utils/audio-helpers";
import { loggers } from "@utils/logger";

const logger = loggers.analyzer;

/**
 * Initialize message listener for audio analysis requests
 */
export function initializeAudioAnalyzer(): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "analyzeAudioUrl") {
      handleAnalyzeRequest(message as AnalyzeAudioUrlMessage, sendResponse);
    }
  });

  logger.info("Audio analyzer initialized");
}

/**
 * Handle audio analysis request
 */
async function handleAnalyzeRequest(
  message: AnalyzeAudioUrlMessage,
  sendResponse: (response: AudioAnalysisResponse) => void,
): Promise<void> {
  const { url, lastModified } = message;

  try {
    const durationMs = await getAudioDuration(url);
    logger.info(`Calculated duration: ${durationMs}ms`);

    // Send back to background script for store registration
    chrome.runtime.sendMessage({
      action: "registerAudioUrl",
      url,
      durationMs,
      lastModified,
    });

    sendResponse({ success: true });
  } catch (error) {
    logger.error(
      `Failed to analyze audio: ${error instanceof Error ? error.message : String(error)}`,
    );
    sendResponse({ success: false });
  }
}
