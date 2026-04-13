import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";
export default defineManifest({
  manifest_version: 3,
  name: "Voice Message Downloader for Facebook",
  version: pkg.version,
  description: "Download voice messages from Facebook and Messenger",

  permissions: ["downloads", "storage", "webRequest"],

  host_permissions: [
    "https://www.facebook.com/*",
    "https://www.messenger.com/*",
    "*://*.fbsbx.com/*",
    "*://*.fbcdn.net/*",
    "*://*.cdninstagram.com/*",
  ],

  content_scripts: [
    {
      matches: ["https://www.facebook.com/*", "https://www.messenger.com/*"],
      js: ["src/content/blob-interceptor.ts"],
      world: "MAIN",
    },
    {
      matches: ["https://www.facebook.com/*", "https://www.messenger.com/*"],
      js: ["src/content/index.ts"],
      css: ["src/content/content.css"],
      run_at: "document_start",
    },
  ],

  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },

  action: {
    default_popup: "src/popup/index.html",
    default_icon: "src/assets/icon.png",
  },
  icons: {
    128: "src/assets/icon.png",
  },
});
