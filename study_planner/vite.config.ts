import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const REPO = "dda1000";
const APP = "study_planner";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? `/${REPO}/${APP}/` : "/",
  server: {
    host: "127.0.0.1",
    port: 5190,
    strictPort: false,
  },
  preview: {
    host: "127.0.0.1",
    port: 4190,
    strictPort: false,
  },
}));
