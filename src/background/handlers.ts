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
    registerElement(message) {
      store.registerElement(
        message.elementId,
        message.durationMs
      ).catch(err => {
        logger.error("Failed to register element:", err);
      });
    },

    registerAudioUrl(message) {
      const isBlobUrl = message.url.startsWith("blob:");
      const mimeType = isBlobUrl ? "audio/ogg" : null;

      store.registerAudioUrl(
        message.durationMs,
        message.url,
        mimeType,
        message.lastModified,
      ).catch(err => {
        logger.error("Failed to register audio URL:", err);
      });
    },

    uiDownloadClicked(message, respond) {
      store.findByElementId(message.elementId).then(item => {
        if (!item?.downloadUrl) {
          respond({ success: false, error: "Audio URL not found yet" });
          return;
        }

        // Blob URL - delegate download to the content script
        if (item.downloadUrl.startsWith("blob:")) {
          logger.info("Blob URL - delegating to content script");
          respond({
            success: true,
            isBlob: true,
            url: item.downloadUrl,
            blobType: item.blobType ?? "audio/ogg",
          });
          return;
        }

        // Network URL - download directly via chrome.downloads
        logger.info("Network URL - initiating download");
        const filename = generateVoiceMessageFilename(item.blobType);

        downloadNetworkUrl(item.downloadUrl, filename)
          .then((downloadId) => respond({ success: true, downloadId }))
          .catch((err) => respond({ success: false, error: err.message }));
      }).catch(err => {
         logger.error("Failed to find item:", err);
         respond({ success: false, error: "Internal store error" });
      });

      return true; // Keep the message port open for the async response
    },
  };
}
