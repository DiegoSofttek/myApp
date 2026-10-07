import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true 
  },
  test: {
    environment: 'happy-dom',
    clearMocks: true,
    restoreMocks: true,
    setupFiles: './src/test/setupTests.js'
  }
})
