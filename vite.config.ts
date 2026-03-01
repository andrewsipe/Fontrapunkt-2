import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { comlink } from "vite-plugin-comlink";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    comlink(),
    nodePolyfills({
      // Only polyfill what we need (buffer, process, global). Excludes crypto so
      // crypto-browserify/elliptic are not resolved or bundled (app uses Web Crypto only).
      include: ["buffer", "process", "global"],
      globals: {
        global: true,
        process: true,
      },
    }),
  ],
  worker: {
    plugins: () => [comlink()],
  },
  resolve: {
    alias: {
      // Ensure buffer polyfill is available for fontkit
      buffer: "buffer",
    },
  },
  define: {
    // Make Buffer available globally for fontkit
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["buffer"],
  },
  // Ensure WASM files are handled correctly
  assetsInclude: ["**/*.wasm"],
  server: {
    proxy: {
      // Proxy local Express server (Fontrapunkt/server) to avoid CORS for no-auth public APIs
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
