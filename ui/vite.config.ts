import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path: for GitHub Pages project site the app lives at /<repo>/.
// Override at build time via `VITE_BASE=/your-repo/ npm run build`.
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  build: { outDir: "dist", sourcemap: false },
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
