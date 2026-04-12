const originalCreateObjectURL = URL.createObjectURL.bind(URL);

URL.createObjectURL = function (obj: Blob | MediaSource): string {
  //1. Create the blob URL as normal
  const blobUrl = originalCreateObjectURL(obj);

  //2. If it's an audio blob, read the raw bytes immediately and send them to the page script
  if (obj instanceof Blob && obj.type.includes("audio")) {
    //3. Create an Audio element to load the blob URL and get the duration (metadata must be loaded first)
    const audio = new Audio(blobUrl);
    audio.onloadedmetadata = () => {
      // 4. Read the raw bytes immediately before Facebook can revoke the URL
      obj.arrayBuffer().then((buffer) => {
        window.postMessage(
          {
            source: "FB_VOICE_DOWNLOADER",
            action: "blobUrlDetected",
            blobUrl,
            blobType: obj.type,
            blobSize: obj.size,
            durationMs: Math.round(audio.duration * 1000),
            // Send raw bytes — these are ours now, Facebook can't revoke them
            blobData: buffer,
          },
          "*",
          [buffer], // transfer ownership, zero-copy
        );
      });
    };
  }

  return blobUrl;
};
