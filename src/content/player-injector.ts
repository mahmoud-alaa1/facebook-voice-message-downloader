import { DOWNLOAD_BUTTON_ICON_SVG } from "@utils/constants";
import { PlayerDOM } from "./player-dom";
export const ATTR = {
  INJECTED: "data-fbvd-injected",
} as const;
/**
 * Injects a download button row beneath a single voice-message player.
 * One instance per player — the ATTR.INJECTED guard prevents duplicates.
 */
export class PlayerInjector {
  constructor(private readonly root: HTMLElement) {
    root.setAttribute(ATTR.INJECTED, "1");
    const button = this.injectButton();
    button.addEventListener("click", () => this.handleClick());
  }

  private injectButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "fbvd-btn fbvd-btn--primary";
    button.type = "button";
    button.title = "Download voice message";
    button.setAttribute("aria-label", "Download voice message");
    button.insertAdjacentHTML("afterbegin", DOWNLOAD_BUTTON_ICON_SVG);

    const container = document.createElement("div");
    container.className = "fbvd-container";
    container.setAttribute("data-fbvd-container", "1");
    container.appendChild(button);

    const anchor = PlayerDOM.findInjectionAnchor(this.root);
    anchor.parentElement?.insertBefore(container, anchor.nextSibling);

    return button;
  }

  private handleClick(): void {
    const durationMs = PlayerDOM.readDurationMs(this.root);
    // Placeholder — download logic comes in the next phase.
    console.log("[fbvd] Download clicked, duration:", durationMs, "ms");
  }
}
