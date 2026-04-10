/**
 * Player Scanner
 * Scans DOM for voice message players and injects download buttons
 */

import { DOM_SELECTORS } from "@types-local/ui";
import { PlayerInjector } from "./player-injector";
import { DomHelpers } from "@utils/dom-helpers";
import { loggers } from "@utils/logger";

const logger = loggers.scanner;

/**
 * Scans Facebook/Messenger DOM for voice players and injects download buttons.
 *
 * Key features:
 * - Initial scan on construction
 * - MutationObserver for dynamically added players (Facebook loads lazily)
 * - Debounces into requestAnimationFrame (~16ms) to batch mutations
 * - Prevents double-injection with INJECTED flag
 */
export class PlayerScanner {
  private pending = false;

  constructor() {
    logger.info("Player scanner initializing...");
    this.scan(document.body);
    this.observeDOM();
    logger.info("Player scanner ready");
  }

  /**
   * Scan for scrubber elements and inject into unprocessed players
   */
  private scan(root: Element): void {
    // Edge case: root element itself is a scrubber
    if (root.matches(DOM_SELECTORS.SCRUBBER)) {
      this.tryInject(root);
      return;
    }

    // Find all scrubbers under root
    root.querySelectorAll(DOM_SELECTORS.SCRUBBER).forEach((scrubber) => {
      this.tryInject(scrubber);
    });
  }

  /**
   * Attempt to inject download button for a player
   * Skips if already injected
   */
  private tryInject(scrubber: Element): void {
    // Already injected - skip
    if (DomHelpers.isAlreadyInjected(scrubber)) {
      return;
    }

    // Find player root
    const root = DomHelpers.findPlayerRoot(scrubber);
    if (!root) {
      return;
    }

    // Mark scrubber as injected (prevents duplicate processing)
    DomHelpers.markAsInjected(scrubber);

    // Inject button
    new PlayerInjector(root);
  }

  /**
   * Watch for dynamically added DOM nodes
   */
  private observeDOM(): void {
    const observer = new MutationObserver((mutations) => {
      // Extract only added Element nodes (skip text/comment)
      const addedElements = mutations.flatMap((m) =>
        DomHelpers.filterElementNodes(m.addedNodes),
      );

      if (addedElements.length === 0 || this.pending) {
        return;
      }

      // Find only roots - elements not contained by other added elements
      const roots = DomHelpers.filterNonOverlapping(addedElements);

      // Debounce scanning into next animation frame
      this.pending = true;
      requestAnimationFrame(() => {
        this.pending = false;
        roots.forEach((root) => this.scan(root));
      });
    });

    // Watch body for child additions
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
