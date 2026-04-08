/**
 * content.ts — Phase 1
 *
 * Scans the Facebook/Messenger DOM for voice-message players and injects
 * a download button beneath each one.
 *
 * No messaging, no network interception, no background communication.
 * That all comes later once the UI layer is solid.
 */

import { PlayerDOM, SCRUBBER_SELECTOR } from "./player-dom";
import { ATTR, PlayerInjector } from "./player-injector";

/**
 * Finds all voice-message players in the DOM and creates a PlayerInjector
 * for each unprocessed one. Driven by an initial scan + MutationObserver
 * to handle Facebook's dynamically loaded content.
 */
class PlayerScanner {
  private scanTimeout: number | null = null;

  constructor() {
    this.scan(document);
    this.observe();
  }

  /**
   * Scans the given root for voice-message players and injects buttons into any new ones found. The root can be the entire document or a subtree added via MutationObserver.
   */
  private scan(root: Element | Document): void {
    root.querySelectorAll(SCRUBBER_SELECTOR).forEach((scrubber) => {
      const playerRoot = PlayerDOM.findRoot(scrubber);
      if (!playerRoot || playerRoot.hasAttribute(ATTR.INJECTED)) return;
      new PlayerInjector(playerRoot);
    });
  }

  /**
   * Observes the DOM for added nodes and scans them for players. Facebook's
   * dynamic content loading means we can't rely on a single initial scan.
   * To avoid excessive scanning during rapid DOM changes, we debounce the scan with a 250ms timeout.
   */
  private observe(): void {
    new MutationObserver((mutations) => {
      // Check if any added nodes are elements before queueing a scan
      const hasElements = mutations.some((m) =>
        Array.from(m.addedNodes).some((n) => n.nodeType === Node.ELEMENT_NODE),
      );

      if (hasElements) {
        if (this.scanTimeout) window.clearTimeout(this.scanTimeout);
        // Wait 250ms for React/FB to finish its current batch of rendering
        this.scanTimeout = window.setTimeout(() => {
          this.scan(document);
        }, 250);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
}

(() => {
  new PlayerScanner();
})();
