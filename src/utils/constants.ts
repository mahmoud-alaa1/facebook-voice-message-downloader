/**
 * Global constants organized by domain
 */

// ============================================================================
// UI ASSETS
// ============================================================================

export const DOWNLOAD_BUTTON_ICON_SVG = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Interface / Download">
<path id="Vector" d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>`;

// ============================================================================
// TIMING & PERFORMANCE
// ============================================================================

/** Debounce delay for DOM scanning (milliseconds) */
export const SCAN_DEBOUNCE_MS = 16; // ~1 animation frame

/** Tolerance for audio duration matching (milliseconds) */
export const DURATION_TOLERANCE_MS = 1000;

/** Storage key for the popup enable/disable toggle */
export const EXTENSION_ENABLED_STORAGE_KEY = "fbvd-enabled";

/** Default state when the toggle has not been stored yet */
export const DEFAULT_EXTENSION_ENABLED = true;

/** Minimum audio file size (bytes) */
export const AUDIO_FILE_MIN_SIZE_BYTES = 1000;

/** Maximum audio file size (bytes) - 200MB */
export const AUDIO_FILE_MAX_SIZE_BYTES = 209_715_200;
