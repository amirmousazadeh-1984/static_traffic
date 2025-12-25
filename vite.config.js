import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";  // اگر از SWC استفاده می‌کنی، این رو عوض کن (پایین توضیح دادم)
import path from "path";

const rootDir = new URL(".", import.meta.url).pathname;

export default defineConfig({
  plugins: [
    react(),  // فقط این کافیه
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
});