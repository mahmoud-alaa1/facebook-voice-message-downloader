const originalCreateObjectURL = window.URL.createObjectURL;

window.URL.createObjectURL = function (obj: Blob | MediaSource): string {
  // 1. Create the Blob URL natively so Facebook functions normally
  const blobUrl = originalCreateObjectURL.call(this, obj);

  // 2. Intercept audio blobs
  if (obj instanceof Blob && obj.type.includes("audio")) {
    // 3. Load the audio to extract its exact duration
    const audio = new Audio(blobUrl);
    audio.onloadedmetadata = () => {
      const durationMs = Math.round(audio.duration * 1000);

      // 4. Send data from MAIN world to ISOLATED world content script
      window.postMessage(
        {
          source: "FB_VOICE_DOWNLOADER",
          action: "blobUrlDetected",
          blobUrl,
          blobType: obj.type,
          blobSize: obj.size,
          durationMs,
        },
        "*",
      );
    };
  }

  return blobUrl;
};
