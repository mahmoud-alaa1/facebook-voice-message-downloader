import { PlayerDOM, SCRUBBER_SELECTOR } from "./player-dom";
import { ATTR, PlayerInjector } from "./player-injector";

/**
 * Scans the Facebook/Messenger DOM for voice-message players and injects
 * a download button beneath each one.
 *
 * Runs an initial scan on construction, then watches for dynamically added
 * nodes via MutationObserver — necessary because Facebook loads messages
 * lazily as the user scrolls.
 */
class PlayerScanner {
  /**
   * Batches mutations that arrive within the same animation frame into a
   * single scan pass. requestAnimationFrame (~16ms) is the right granularity:
   * fast enough that buttons appear instantly, slow enough to avoid scanning
   * hundreds of times during rapid React re-renders.
   */
  private pending = false;

  constructor() {
    this.scan(document.body);
    this.observe();
  }

  /**
   * Scans `root` for voice-message players and injects download UI into any
   * unprocessed ones. Handles the edge case where root itself is a scrubber.
   */
  private scan(root: Element): void {
    if (root.matches(SCRUBBER_SELECTOR)) {
      this.tryInject(root);
      return;
    }
    root.querySelectorAll(SCRUBBER_SELECTOR).forEach((s) => this.tryInject(s));
  }

  /**
   * Attempts to inject a download UI below the voice player that owns `scrubber`.
   * Guards against double-injection by marking the scrubber element itself —
   * the flex row can be re-rendered by React while the scrubber persists.
   */
  private tryInject(scrubber: Element): void {
    if (scrubber.hasAttribute(ATTR.INJECTED)) return;

    const root = PlayerDOM.findRoot(scrubber);
    if (!root) return;

    scrubber.setAttribute(ATTR.INJECTED, "1");
    new PlayerInjector(root);
  }

  /**
   * Watches for dynamically added nodes and scans them for players.
   *
   * Per-mutation optimizations:
   * 1. Collect only added Element nodes — text/comment nodes can't contain players.
   * 2. Drop descendants — scanning an ancestor already covers all its children.
   * 3. Debounce into one rAF callback to batch rapid successive mutations.
   */
  private observe(): void {
    new MutationObserver((mutations) => {
      const added = mutations.flatMap((m) =>
        [...m.addedNodes].filter(
          (n): n is Element => n.nodeType === Node.ELEMENT_NODE,
        ),
      );
      if (!added.length || this.pending) return;

      // Skip nodes already covered by an ancestor in the same batch
      const roots = added.filter(
        (el) => !added.some((a) => a !== el && a.contains(el)),
      );

      this.pending = true;
      requestAnimationFrame(() => {
        this.pending = false;
        roots.forEach((root) => this.scan(root));
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
}

(() => {
  new PlayerScanner();
})();
