import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - change to your repo name if not username.github.io
  // For repo "chess" -> base: '/chess/'
  // For username.github.io -> base: '/'
  base: process.env.GITHUB_PAGES ? '/chess/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
