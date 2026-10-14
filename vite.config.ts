import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

import aitDevtools from "@apps-in-toss/devtools/unplugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [aitDevtools.vite(), react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^lottie-web$/,
        replacement: "lottie-web/build/player/lottie_light.js",
      },
    ],
  },
});
