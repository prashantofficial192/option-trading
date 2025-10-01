import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // 👈 allows access from LAN (mobile)
    port: 5173,   // default port (change if needed)
  },
})
