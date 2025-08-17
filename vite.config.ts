import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/sui-zklogin-demo/",
  plugins: [react()],
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
