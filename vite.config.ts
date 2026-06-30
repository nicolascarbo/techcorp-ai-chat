import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const ollamaUrl = env.VITE_OLLAMA_URL ?? 'http://localhost:11434'

  return {
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/ollama': {
        target: ollamaUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      },
    },
  },
  }
});