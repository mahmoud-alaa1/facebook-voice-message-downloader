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

/** Memory cleanup interval (milliseconds) */
export const STORE_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/** Max age for store items before cleanup (milliseconds) */
export const STORE_ITEM_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

/** Cache cleanup interval for network URL tracking (milliseconds) */
export const NETWORK_CACHE_CLEANUP_INTERVAL_MS = 5000; // 5000 ms = 5 seconds

// ============================================================================
// NETWORK FILTERING
// ============================================================================

/** Minimum audio file size (bytes) */
export const AUDIO_FILE_MIN_SIZE_BYTES = 1000;

/** Maximum audio file size (bytes) - 200MB */
export const AUDIO_FILE_MAX_SIZE_BYTES = 209_715_200;
