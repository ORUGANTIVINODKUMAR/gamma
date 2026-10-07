import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks for better caching. three.js needs no group:
        // it is only reachable through the lazy HeroScene import, so it is split
        // into its own on-demand chunk automatically.
        codeSplitting: {
          groups: [
            { name: 'motion', test: /node_modules[\/](framer-motion|motion-dom|motion-utils)/ },
            { name: 'react', test: /node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/ },
          ],
        },
      },
    },
  },
})
