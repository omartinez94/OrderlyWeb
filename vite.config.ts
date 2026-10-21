import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "^/(identity-api|catalog-api|ordering-api|order-api|kitchen-api|basket-api|discount-api|notification-api)":
        {
          target: "http://localhost:6004",
          changeOrigin: true,
          ws: true,
        },
    },
  },
});
