// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/ons-dashboard/",
  plugins: [react()],
  server: {
    proxy: {
      "/ons": {
        target: "https://api.beta.ons.gov.uk/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ons/, ""),
      },
    },
  },
});
