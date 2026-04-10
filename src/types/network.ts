/**
 * Network interception and CDN-related types
 */

export const CDN_PATTERNS = [
  "*://*.fbcdn.net/*",
  "*://*.cdninstagram.com/*",
  "*://*.fbsbx.com/*",
];

export const VALID_AUDIO_CONTENT_TYPES = [
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mpeg4",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/x-aac",
  "audio/flac",
  "audio/x-flac",
] as const;

export type AUDIO_TYPES = (typeof VALID_AUDIO_CONTENT_TYPES)[number];

export type AudioContentType = (typeof VALID_AUDIO_CONTENT_TYPES)[number];

export interface NetworkRequestMetadata {
  url: string;
  contentType: string;
  contentLength: number;
  lastModified: string | null;
  statusCode: number;
  method: string;
}

/**
 * Represents a detected audio message from network
 */
export interface DetectedAudioMessage {
  url: string;
  durationMs: number;
  contentType: string;
  lastModified: string | null;
  source: "network" | "blob";
}
