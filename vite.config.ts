import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [crx({ manifest })],
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
});
