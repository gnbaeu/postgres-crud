import { defineConfig, loadEnv } from "vite";
import { validateClientEnvironment } from "./scripts/env-safety.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  validateClientEnvironment(env);

  const apiTarget = env.GNWAA_API_BACKEND === "laravel" ? "http://127.0.0.1:3002" : "http://127.0.0.1:3001";

  return {
    server: {
      host: "127.0.0.1",
      proxy: { "/api/": { target: apiTarget, changeOrigin: true }, "/healthz": { target: apiTarget } }
    },
    preview: {
      host: "127.0.0.1",
      proxy: { "/api/": { target: apiTarget, changeOrigin: true }, "/healthz": { target: apiTarget } }
    },
    build: { outDir: "dist", emptyOutDir: true }
  };
});
