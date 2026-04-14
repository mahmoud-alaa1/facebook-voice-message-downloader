/**
 * Protocol messages sent from content scripts to the background.
 */

/** Register a DOM element representing a voice message player. */
export interface RegisterElementMessage {
  action: "registerElement";
  elementId: string;
  durationMs: number;
}

/** Register an audio URL intercepted from network or blob. */
export interface RegisterAudioUrlMessage {
  action: "registerAudioUrl";
  url: string;
  durationMs: number;
  lastModified: string | null;
}

/** User clicked the download button. */
export interface UiDownloadClickedMessage {
  action: "uiDownloadClicked";
  elementId: string;
}

export type ContentToBackgroundMessage =
  | RegisterElementMessage
  | RegisterAudioUrlMessage
  | UiDownloadClickedMessage;
