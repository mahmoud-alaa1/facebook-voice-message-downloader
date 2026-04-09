export const SCRUBBER_SELECTOR = '[role="slider"][aria-label="Audio scrubber"]';

/**
 * From the DOM snapshot, the scrubber is always exactly 2 levels deep
 * inside the player flex row:
 *
 *   flexRow
 *     div  (scrubber cell)
 *       div[role="slider"][aria-label="Audio scrubber"]  ← scrubber
 *
 * So: scrubber.parentElement.parentElement === flexRow
 *
 * We verify the flexRow by confirming it ALSO contains
 * [aria-label="Play"] and [role="timer"] as descendants,
 * and that it is NOT inside the composer ([role="group"]).
 */

export const PlayerDOM = {
  /**
   * Returns the player flex row — the direct parent of the three cells
   * (play, scrubber, timer). Our container is injected as its next sibling.
   */
  findRoot(scrubber: Element): HTMLElement | null {
    const flexRow = scrubber.parentElement?.parentElement;
    if (!flexRow) return null;

    // Structural check: must contain Play button and timer
    const hasPlay = !!flexRow.querySelector(
      '[aria-label="Play"][role="button"]',
    );
    const hasTimer = !!flexRow.querySelector('[role="timer"]');
    if (!hasPlay || !hasTimer) return null;

    // Composer guard: must not be inside the thread composer
    if (flexRow.closest('[aria-label="Thread composer"]')) return null;

    // Recording guard: must not be inside a recording UI
    if (flexRow.closest('[aria-label="Stop recording"]')) return null;

    return flexRow as HTMLElement;
  },

  readDurationMs(root: HTMLElement): number {
    const scrubber = root.querySelector<Element>(SCRUBBER_SELECTOR);
    if (scrubber) {
      const max = parseFloat(scrubber.getAttribute("aria-valuemax") ?? "");
      if (Number.isFinite(max) && max > 0) return Math.round(max * 1000);
    }
    const timerText = root.querySelector('[role="timer"]')?.textContent?.trim();
    if (timerText) {
      const parts = timerText.split(":").map(Number);
      if (parts.length >= 2 && parts.every(Number.isFinite)) {
        return parts.reduce((acc, n) => acc * 60 + n, 0) * 1000;
      }
    }
    return 0;
  },
} as const;
