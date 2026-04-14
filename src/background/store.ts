/**
 * VoiceMessageStore - Manages state matching between DOM elements and audio URLs
 *
 * This store uses fuzzy duration matching to pair:
 * 1. DOM elements (from content script)
 * 2. Network-intercepted or blob-detected audio URLs
 *
 * Key insight: Network requests often arrive before DOM elements render,
 * so we store "orphaned" URLs and match them when elements appear.
 */

/**
 * Represents a voice message item in the store
 * - id: Unique identifier (from content script or generated for orphans)
 * - durationMs: Duration read from DOM (in milliseconds)
 * - downloadUrl: Intercepted URL (fbcdn, blob, or null if pending)
 * - lastModified: Last-Modified header from network response
 * - timestamp: When the item was registered (for cleanup)
 * - isPending: True if we have DOM element but no URL yet
 * - blobType: MIME type if the URL is a Blob
 */
export interface VoiceMessageItem {
  id: string;
  durationMs: number;
  downloadUrl: string | null;
  lastModified: string | null;
  timestamp: number;
  isPending: boolean;
  blobType?: string;
}

export type VoiceMessageItemPartial = Partial<VoiceMessageItem>;

import { DURATION_TOLERANCE_MS } from "@utils/constants";
import { loggers } from "@utils/logger";

const logger = loggers.store;

export class VoiceMessageStore {
  private items: Map<string, VoiceMessageItem>;
  private readonly TOLERANCE_MS = DURATION_TOLERANCE_MS;
  private loadPromise: Promise<void>;

  constructor() {
    this.items = new Map();
    this.loadPromise = this.internalLoad();
  }

  private async internalLoad(): Promise<void> {
    try {
      const result = await chrome.storage.session.get("VoiceMessageStore");
      if (result.VoiceMessageStore) {
        const parsed = JSON.parse(result.VoiceMessageStore);
        this.items = new Map(parsed);
        logger.info("Loaded " + this.items.size + " items from session storage");
      }
    } catch (e) {
      logger.error("Failed to load store from session: " + e);
    }
  }

  private async save(): Promise<void> {
    try {
      const data = JSON.stringify([...this.items.entries()]);
      await chrome.storage.session.set({ VoiceMessageStore: data });
    } catch (e) {
      logger.error("Failed to save store to session: " + e);
    }
  }

  /**
   * Register a DOM element representing a voice message player.
   * Checks if an orphaned URL already exists and matches it.
   */
  public async registerElement(
    id: string,
    durationMs: number,
  ): Promise<void> {
    await this.loadPromise;

    // Try to adopt an existing orphaned URL that matches
    for (const [existingId, item] of this.items.entries()) {
      if (
        !item.isPending &&
        existingId.startsWith("orphan-") &&
        this.isDurationMatch(item.durationMs, durationMs)
      ) {
        // Found a waiting URL - adopt it
        const adoptedItem: VoiceMessageItem = {
          id,
          durationMs: item.durationMs, // Keep precise network duration
          downloadUrl: item.downloadUrl,
          lastModified: item.lastModified,
          timestamp: Date.now(),
          isPending: false, // Ready immediately
        };
        if (item.blobType) adoptedItem.blobType = item.blobType;

        this.items.set(id, adoptedItem);
        this.items.delete(existingId);
        await this.save();
        logger.info("Adopted orphaned URL for element: " + id);
        return;
      }
    }

    // No matching URL yet - register as pending
    this.items.set(id, {
      id,
      durationMs,
      downloadUrl: null,
      lastModified: null,
      timestamp: Date.now(),
      isPending: true,
    });
    await this.save();
    logger.info("Registered pending element: " + id + " (" + durationMs + "ms)");
  }

  /**
   * Register an intercepted audio URL.
   * Uses fuzzy matching to link to a pending DOM element or creates orphan.
   */
  public async registerAudioUrl(
    durationMs: number,
    url: string,
    mimeType: string | null = null,
    lastModified: string | null = null,
  ): Promise<string> {
    await this.loadPromise;

    // Look for matching pending element
    let bestMatchId: string | null = null;
    let smallestDiff = Infinity;

    for (const [id, item] of this.items.entries()) {
      if (item.isPending && this.isDurationMatch(item.durationMs, durationMs)) {
        const diff = Math.abs(item.durationMs - durationMs);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          bestMatchId = id;
        }
      }
    }

    if (bestMatchId) {
      const item = this.items.get(bestMatchId)!;
      item.downloadUrl = url;
      item.lastModified = lastModified;
      if (mimeType) item.blobType = mimeType;
      item.isPending = false;

      await this.save();
      logger.info("Matched URL to element: " + bestMatchId + " (" + durationMs + "ms)");
      return bestMatchId;
    }

    // Edge case: URL arrived before DOM element
    // Create "orphaned" record to be adopted later
    const orphanId = "orphan-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    const orphanItem: VoiceMessageItem = {
      id: orphanId,
      durationMs,
      downloadUrl: url,
      lastModified,
      timestamp: Date.now(),
      isPending: false, // Has URL, waiting for element
    };
    if (mimeType) orphanItem.blobType = mimeType;

    this.items.set(orphanId, orphanItem);
    await this.save();

    logger.info("Created orphaned URL: " + orphanId + " (" + durationMs + "ms)");
    return orphanId;
  }

  /**
   * Find an item by its element ID.
   */
  public async findByElementId(elementId: string): Promise<VoiceMessageItem | null> {
    await this.loadPromise;
    return this.items.get(elementId) ?? null;
  }

  /**
   * Check if two durations match within tolerance
   */
  private isDurationMatch(a: number, b: number): boolean {
    return Math.abs(a - b) <= this.TOLERANCE_MS;
  }

  /** Get current store size for debugging */
  public get size(): number {
    return this.items.size;
  }
}
