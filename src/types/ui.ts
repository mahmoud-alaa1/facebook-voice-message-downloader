/**
 * UI-related types and selectors
 */

export const DOM_SELECTORS = {
  /** Audio scrubber element in voice message player */
  SCRUBBER: '[role="slider"][aria-label="Audio scrubber"]',

  /** Play button in player */
  PLAY_BUTTON: '[aria-label="Play"][role="button"]',

  /** Timer display in player */
  TIMER: '[role="timer"]',

  /** Thread composer guard */
  THREAD_COMPOSER: '[aria-label="Thread composer"]',

  /** Recording UI guard */
  RECORDING_UI: '[aria-label="Stop recording"]',
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
