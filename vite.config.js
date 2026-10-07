import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
  esbuild: {
    jsx: 'automatic',
    loader: 'tsx',
    include: /src\/.*\.[jt]sx?$/,
  },
})
