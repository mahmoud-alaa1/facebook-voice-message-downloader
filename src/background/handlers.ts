/**
 * Background message handlers
 * Each function handles one incoming ContentMessage action.
 * Handlers are pure functions of (message, store) — no global state.
 */

import { VoiceMessageStore } from "./store";
import {
  downloadNetworkUrl,
  generateVoiceMessageFilename,
} from "@utils/download-helpers";
import { HandlerMap } from "@messaging/contract";
import { loggers } from "@utils/logger";

const logger = loggers.background;

export function makeHandlers(store: VoiceMessageStore): HandlerMap {
  return {
    registerElement(message, respond) {
      store.registerElement(message.elementId, message.durationMs);
      respond({ success: true });
    },

    registerAudioUrl(message, respond) {
      const isBlobUrl = message.url.startsWith("blob:");
      const mimeType = isBlobUrl ? "audio/ogg" : null;

      store.registerAudioUrl(
        message.durationMs,
        message.url,
        mimeType,
        message.lastModified,
      );
      respond({ success: true });
    },

    uiDownloadClicked(message, respond) {
      const item = store.findByElementId(message.elementId);

      if (!item?.downloadUrl) {
        respond({ success: false, error: "Audio URL not found yet" });
        return;
      }

      // Blob URL — delegate download to the content script
      if (item.downloadUrl.startsWith("blob:")) {
        logger.info("Blob URL — delegating to content script");
        respond({
          success: true,
          isBlob: true,
          url: item.downloadUrl,
          blobType: item.blobType ?? "audio/ogg",
        });
        return;
      }

      // Network URL — download directly via chrome.downloads
      logger.info("Network URL — initiating download");
      const filename = generateVoiceMessageFilename(item.blobType);

      downloadNetworkUrl(item.downloadUrl, filename)
        .then((downloadId) => respond({ success: true, downloadId }))
        .catch((err) => respond({ success: false, error: err.message }));

      return true; // async
    },
  };
}
