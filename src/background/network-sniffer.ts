/**
 * Network request interception for audio detection
 * Monitors CDN requests and extracts audio metadata
 */

import {
  AudioContentType,
  CDN_PATTERNS,
  VALID_AUDIO_CONTENT_TYPES,
} from "@types-local/network";
import {
  AUDIO_FILE_MIN_SIZE_BYTES,
  AUDIO_FILE_MAX_SIZE_BYTES,
  NETWORK_CACHE_CLEANUP_INTERVAL_MS,
} from "@utils/constants";
import { Messages } from "@messaging/contract";
import { loggers } from "@utils/logger";

const logger = loggers.sniffer;

const processedUrls = new Set<string>();

function isAudioContentType(value: string): value is AudioContentType {
  return (VALID_AUDIO_CONTENT_TYPES as readonly string[]).includes(value);
}

export function initializeNetworkSniffer(): void {
  setInterval(() => processedUrls.clear(), NETWORK_CACHE_CLEANUP_INTERVAL_MS);

  // onHeadersReceived is sufficient — we only need response headers
  chrome.webRequest.onHeadersReceived.addListener(
    handleNetworkRequest,
    { urls: CDN_PATTERNS },
    ["responseHeaders"],
  );

  logger.info("Network sniffer initialized");
}

function handleNetworkRequest(
  details: chrome.webRequest.WebResponseHeadersDetails,
): void {
  const { url, method, statusCode, responseHeaders } = details;

  // Only consider successful GET requests
  if (method !== "GET" || ![200, 206].includes(statusCode ?? 0)) return;

  // Avoid re-processing the same URL multiple times
  if (processedUrls.has(url)) return;

  const meta = extractHeaderMetadata(responseHeaders);

  // Filter out non-audio content types and implausibly small/large files
  if (!isAudioContentType(meta.contentType)) return;

  // Some CDN responses may have content-length of 0 or be missing it entirely — skip those
  if (
    meta.contentLength > 0 &&
    (meta.contentLength < AUDIO_FILE_MIN_SIZE_BYTES ||
      meta.contentLength > AUDIO_FILE_MAX_SIZE_BYTES)
  )
    return;

  // Mark URL as processed and broadcast to Facebook tabs
  processedUrls.add(url);
  logger.info(`Intercepted audio: ${url.substring(0, 60)}...`);

  broadcastToFacebookTabs(url, meta.lastModified);
}

function extractHeaderMetadata(
  headers: chrome.webRequest.HttpHeader[] | undefined,
): { contentType: string; contentLength: number; lastModified: string | null } {
  let contentType = "";
  let contentLength = 0;
  let lastModified: string | null = null;

  for (const { name, value = "" } of headers ?? []) {
    const lower = name.toLowerCase();
    if (lower === "content-type") contentType = value;
    if (lower === "content-length") contentLength = parseInt(value, 10);
    if (lower === "last-modified") lastModified = value;
  }

  return { contentType, contentLength, lastModified };
}

function broadcastToFacebookTabs(
  url: string,
  lastModified: string | null,
): void {
  chrome.tabs.query(
    { url: ["*://*.facebook.com/*", "*://*.messenger.com/*"] },
    (tabs) => {
      for (const tab of tabs) {
        if (tab.id) {
          Messages.background.analyzeAudioUrl(tab.id, { url, lastModified });
        }
      }
    },
  );
}
