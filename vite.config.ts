import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config.ts";
import zip from "vite-plugin-zip-pack";
import { name, version } from "./package.json";

export default defineConfig({
  plugins: [
    crx({ manifest }),
    zip({ outDir: "release", outFileName: `crx-${name}-${version}.zip` }),
  ],

  resolve: {
    alias: {
      "@content": "/src/content",
      "@background": "/src/background",
      "@utils": "/src/utils",
      "@types-local": "/src/types",
      "@messaging": "/src/messaging",
      "@protocol": "/src/protocol",
    },
  },
  server: {
    port: 5173,
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
