import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const plugins = [react(), tailwindcss()];
  if (command !== "serve") {
    return { plugins };
  }

  const env = loadEnv(mode, process.cwd(), "");
  if (!env.WEB_PORT || !env.API_PROXY_TARGET) {
    throw new Error(
      "Missing WEB_PORT or API_PROXY_TARGET. Check apps/web/.env (run `npm run env`).",
    );
  }
  return {
    plugins,
    server: {
      port: Number(env.WEB_PORT),
      proxy: { "/api": env.API_PROXY_TARGET },
    },
  };
});
