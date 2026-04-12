/**
 * Stable DOM selectors for Facebook/Messenger audio UI.
 *
 * Strategy:
 * - Prefer ARIA roles and attributes (language-agnostic).
 * - Avoid class names and IDs (frequently obfuscated/unstable).
 */
export const DOM_SELECTORS = {
  /** Audio scrubber (progress bar) */
  SCRUBBER: '[role="slider"][aria-valuemin="0"][aria-valuemax]',

  /** Play button inside audio player */
  PLAY_BUTTON: '[role="button"][style*="background-color: transparent"]',

  /** Audio timer display */
  TIMER: '[role="timer"]',

  /** Message composer container (used as guard) */
  THREAD_COMPOSER: '[role="complementary"]',

  /** Recording UI (shares structure with play button) */
  RECORDING_UI: '[role="button"][style*="background-color: transparent"]',
} as const;

export const DOM_ATTRIBUTES = {
  INJECTED: "data-fbvd-injected",
  ELEMENT_ID: "data-fbvd-id",
  CONTAINER: "data-fbvd-container",
} as const;

export const CSS_CLASSES = {
  CONTAINER: "fbvd-container",
  BUTTON: "fbvd-btn",
  BUTTON_PRIMARY: "fbvd-btn--primary",
} as const;

/** Player UI element dimensions (px) */
export const PLAYER_UI_DIMENSIONS = {
  BUTTON_SIZE: 28,
  BUTTON_ICON_SIZE: 16,
} as const;
