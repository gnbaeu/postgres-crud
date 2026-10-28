import { defineConfig, loadEnv } from "vite";
import { validateClientEnvironment } from "./scripts/env-safety.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  validateClientEnvironment(env);

  return {
    server: {
      host: "127.0.0.1",
      proxy: { "/api/": { target: "http://127.0.0.1:3001", changeOrigin: true }, "/healthz": { target: "http://127.0.0.1:3001" } }
    },
    preview: {
      host: "127.0.0.1",
      proxy: { "/api/": { target: "http://127.0.0.1:3001", changeOrigin: true }, "/healthz": { target: "http://127.0.0.1:3001" } }
    },
    build: { outDir: "dist", emptyOutDir: true }
  };
});
