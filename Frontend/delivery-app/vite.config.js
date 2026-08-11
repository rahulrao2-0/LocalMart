import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Fixed port so the API gateway CORS allowlist can whitelist it.
    // Customer-app runs on 5173, seller-app on 5174.
    port: 5175,
    strictPort: false,
  },
  preview: { port: 5175 },
})
