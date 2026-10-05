import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const REPO = "dda1000";
const APP = "calendar";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? `/${REPO}/${APP}/` : "/",
  server: {
    host: "127.0.0.1",
    port: 5179,
    strictPort: false,
  },
}));
