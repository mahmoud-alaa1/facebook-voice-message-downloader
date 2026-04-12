import { initializeBlobBridge } from "./blob-bridge";
import { initializeAudioAnalyzer } from "./audio-analyzer";
import { PlayerScanner } from "./player-scanner";
import { loggers } from "@utils/logger";
import {
  getExtensionEnabledState,
  onExtensionEnabledStateChanged,
} from "@utils/extension-state";

const logger = loggers.content;

/**
 * Content script entry point. Initializes the player scanner and related utilities.
 *
 * Responsibilities:
 * - Initializes the blob bridge for audio data transfer
 * - Initializes the audio analyzer for duration extraction
 * - Creates and manages the PlayerScanner instance
 * - Listens for extension enabled state changes to start/stop the scanner
 *
 */
async function initialize(): Promise<void> {
  logger.info("Content script initializing...");

  initializeBlobBridge();
  initializeAudioAnalyzer();

  const scanner = new PlayerScanner();
  scanner.setEnabled(await getExtensionEnabledState());
  onExtensionEnabledStateChanged((enabled) => {
    scanner.setEnabled(enabled);
  });

  logger.info("Content script ready");
}

void initialize();
