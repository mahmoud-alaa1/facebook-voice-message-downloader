/**
 * DOM manipulation and query utilities
 */

import { DOM_SELECTORS, DOM_ATTRIBUTES, CSS_CLASSES } from "@types-local/ui";

export const DomHelpers = {
  /**
   * Find the player flex row from a scrubber element
   * Returns null if structural requirements aren't met
   */
  findPlayerRoot(scrubber: Element): HTMLElement | null {
    const flexRow = scrubber.parentElement?.parentElement;
    if (!flexRow) return null;

    // Verify structure: must have play button and timer
    const hasPlay = !!flexRow.querySelector(DOM_SELECTORS.PLAY_BUTTON);
    const hasTimer = !!flexRow.querySelector(DOM_SELECTORS.TIMER);
    if (!hasPlay || !hasTimer) return null;

    // Guard against composer
    if (flexRow.closest(DOM_SELECTORS.THREAD_COMPOSER)) return null;

    // Guard against recording UI
    if (flexRow.closest(DOM_SELECTORS.RECORDING_UI)) return null;

    return flexRow as HTMLElement;
  },

  /**
   * Extract audio duration from player DOM
   * Tries scrubber aria-valuemax first, then falls back to timer text
   */
  readPlayerDurationMs(playerRoot: HTMLElement): number {
    const scrubber = playerRoot.querySelector<Element>(DOM_SELECTORS.SCRUBBER);
    if (scrubber) {
      const max = parseFloat(scrubber.getAttribute("aria-valuemax") ?? "0");
      if (Number.isFinite(max) && max > 0) return max * 1000;
    }

    const timerText = playerRoot
      .querySelector(DOM_SELECTORS.TIMER)
      ?.textContent?.trim();
    if (timerText) {
      const parts = timerText.split(":").map(Number);
      if (parts.length >= 2 && parts.every(Number.isFinite)) {
        return parts.reduce((acc, n) => acc * 60 + n, 0) * 1000;
      }
    }

    return 0;
  },

  /**
   * Check if element is already marked as injected
   */
  isAlreadyInjected(element: Element): boolean {
    return element.hasAttribute(DOM_ATTRIBUTES.INJECTED);
  },

  /**
   * Mark element as injected with optional element ID
   */
  markAsInjected(element: Element, elementId?: string): void {
    element.setAttribute(DOM_ATTRIBUTES.INJECTED, "1");
    if (elementId) {
      element.setAttribute(DOM_ATTRIBUTES.ELEMENT_ID, elementId);
    }
  },

  /**
   * Create download button element with icon
   */
  createDownloadButton(iconSvg: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = `${CSS_CLASSES.BUTTON} ${CSS_CLASSES.BUTTON_PRIMARY}`;
    button.type = "button";
    button.title = "Download voice message";
    button.setAttribute("aria-label", "Download voice message");
    button.insertAdjacentHTML("afterbegin", iconSvg);
    return button;
  },

  /**
   * Create container for injected UI
   */
  createContainer(button: HTMLElement): HTMLDivElement {
    const container = document.createElement("div");
    container.className = CSS_CLASSES.CONTAINER;
    container.setAttribute(DOM_ATTRIBUTES.CONTAINER, "1");
    container.appendChild(button);
    return container;
  },

  /**
   * Insert container into DOM after player element
   */
  insertContainerAfterPlayer(
    playerRoot: HTMLElement,
    container: HTMLElement,
  ): void {
    const anchor = playerRoot.parentElement ?? playerRoot;
    anchor.parentElement?.insertBefore(container, anchor.nextSibling);
  },

  /**
   * Find all non-overlapping descendants in an array of elements
   * Removes elements that are descendants of other elements in the array
   */
  filterNonOverlapping(elements: Element[]): Element[] {
    return elements.filter(
      (el) => !elements.some((a) => a !== el && a.contains(el)),
    );
  },

  /**
   * Extract Element nodes from a list of nodes
   */
  filterElementNodes(nodes: NodeList | Node[]): Element[] {
    return [...nodes].filter(
      (n): n is Element => n.nodeType === Node.ELEMENT_NODE,
    );
  },
};
