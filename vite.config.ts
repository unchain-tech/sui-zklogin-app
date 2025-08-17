import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/sui-zklogin-demo/",
  plugins: [react()],
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
