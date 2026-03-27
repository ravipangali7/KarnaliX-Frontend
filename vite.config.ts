import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // recharts + d3-* have circular dependencies — let Vite auto-split them
          // to avoid "Cannot access before initialization" TDZ errors.
          if (id.includes("framer-motion")) {
            return "vendor-motion";
          }
          if (id.includes("@radix-ui") || id.includes("@floating-ui") || id.includes("cmdk") || id.includes("vaul")) {
            return "vendor-ui";
          }
          if (id.includes("@tanstack")) {
            return "vendor-query";
          }
          // react, react-dom, react-router and their deps MUST share a chunk —
          // splitting them causes the __SECRET_INTERNALS error because react-dom
          // looks up React internals from a different chunk before it's loaded.
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/scheduler/") ||
            id.includes("node_modules/use-sync-external-store/")
          ) {
            return "vendor-react";
          }
        },
      },
    },
  },
}));
