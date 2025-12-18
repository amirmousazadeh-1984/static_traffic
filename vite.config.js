import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import path from "path";
const rootDir = new URL(".", import.meta.url).pathname;
export default defineConfig({
  plugins: [
    react(),
    // eslint({
    //   cache: false,
    //   fix: true,
    //   lintOnStart: true,
    //   failOnError: false,
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
});
