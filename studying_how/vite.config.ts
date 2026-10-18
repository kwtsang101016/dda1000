import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const REPO = "dda1000";
const APP = "studying_how";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? `/${REPO}/${APP}/` : "/",
  server: {
    host: "127.0.0.1",
    port: 5185,
    strictPort: false,
  },
}));
