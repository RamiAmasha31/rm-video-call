import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    open: true, // Automatically open the browser on server start
    // port: 3002, // Specify port if necessary
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./video-call"),
    },
  },
});
