/**
 * Protocol messages sent from background to content scripts.
 */

/** Request content script to analyze audio URL. */
export interface AnalyzeAudioUrlMessage {
  action: "analyzeAudioUrl";
  url: string;
  lastModified: string | null;
}

export type BackgroundToContentMessage = AnalyzeAudioUrlMessage;
