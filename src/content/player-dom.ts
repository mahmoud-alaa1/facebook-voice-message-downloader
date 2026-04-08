export const SCRUBBER_SELECTOR =
  '[role="slider"][aria-label="Audio scrubber"], ' +
  '[role="slider"][aria-valuemax][aria-valuemin]';

/**
 * Pure DOM-query helpers scoped to the Facebook voice-message player shape.
 * No state, no side-effects — easy to update when FB ships new markup.
 */
export const PlayerDOM = {
  /**
   * Walk up from any element inside a voice bubble to the outermost container
   * that owns both a play button and a scrubber.
   *
   * From the DOM snapshot:
   *   outer div[style="height:70px;width:218px"]   ← player root  (we want this)
   *     inner div[data-fbvd-injected]               ← flex wrapper
   *       div > button[role=button] svg             ← play button
   *       div > div[role=slider]                    ← scrubber
   *       div > div[role=timer]                     ← timer
   */
  findRoot(el: Element): HTMLElement | null {
    let node: Element | null = el;
    while (node && node !== document.body) {
      const hasPlay = node.querySelector('[role="button"] svg') !== null;
      const hasScrubber = node.querySelector(SCRUBBER_SELECTOR) !== null;
      if (hasPlay && hasScrubber) return node as HTMLElement;
      node = node.parentElement;
    }
    return null;
  },

  /**
   * Read duration in milliseconds from the scrubber's aria-valuemax (seconds),
   * falling back to the mm:ss timer text. Returns 0 if unreadable.
   */
  readDurationMs(root: HTMLElement): number {
    const scrubber = root.querySelector(SCRUBBER_SELECTOR);
    if (scrubber) {
      const seconds = parseFloat(scrubber.getAttribute("aria-valuemax") ?? "");
      if (Number.isFinite(seconds) && seconds > 0) {
        return Math.round(seconds * 1000);
      }
    }

    const timerText = root.querySelector('[role="timer"]')?.textContent?.trim();

    if (timerText) {
      const parts = timerText.split(":").map(Number);
      // Rejects if there are non-numbers (NaN)
      if (parts.some((n) => !Number.isFinite(n))) return 0;

      // Converts [hours, minutes, seconds] or [minutes, seconds] safely into total seconds
      const totalSeconds = parts.reduce((acc, time) => 60 * acc + time, 0);
      return totalSeconds * 1000;
    }

    return 0;
  },

  /**
   * The node after which the button row is inserted.
   * Targets the nearest role="presentation" ancestor so the button appears
   * outside the message bubble, not inside it.
   */
  findInjectionAnchor(root: HTMLElement): HTMLElement {
    return root.closest<HTMLElement>('[role="presentation"]') ?? root;
  },
} as const;
