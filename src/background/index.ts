/**
 * Background Service Worker
 * Handles message routing and download coordination
 */

import { initializeNetworkSniffer } from "./network-sniffer";
import { VoiceMessageStore } from "./store";
import { createMessageRouter } from "@messaging/contract";
import { makeHandlers } from "./handlers";
import { loggers } from "@utils/logger";

const logger = loggers.background;
const store = new VoiceMessageStore();

function initialize(): void {
  logger.info("Initializing background service worker");

  chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== "install") return;
    chrome.action.openPopup();

    chrome.tabs.query(
      { url: ["https://www.facebook.com/*", "https://www.messenger.com/*"] },
      (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) chrome.tabs.reload(tab.id);
        });
      },
    );
  });
  initializeNetworkSniffer();
  createMessageRouter(makeHandlers(store));
}

initialize();
