/**
 * Audio processing and duration calculation utilities
 */

/**
 * Load an audio URL and extract its duration in milliseconds
 * Handles both network URLs and blob URLs
 */
export async function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.src = url;
    audio.preload = "metadata";

    const cleanup = () => audio.remove();

    audio.onloadedmetadata = () => {
      const durationMs = Math.round(audio.duration * 1000);
      cleanup();
      resolve(durationMs);
    };

    audio.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load audio metadata from: ${url}`));
    };

    // Set a timeout to prevent hanging
    setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout loading audio metadata from: ${url}`));
    }, 5000);
  });
}

/**
 * Determine file extension based on MIME type
 */
export function getAudioFileExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("flac")) return "flac";
  if (mimeType.includes("aac")) return "aac";
  if (mimeType.includes("mpeg")) return "mp3";
  return "ogg"; // default
}

/**
 * Validate audio MIME type
 */
export function isValidAudioType(mimeType: string): boolean {
  const validTypes = ["audio/"];
  return validTypes.some((type) => mimeType.includes(type));
}
