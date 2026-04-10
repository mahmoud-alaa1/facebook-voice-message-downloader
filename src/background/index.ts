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

  initializeNetworkSniffer();
  createMessageRouter(makeHandlers(store));
}

initialize();
