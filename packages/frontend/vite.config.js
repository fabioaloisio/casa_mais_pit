import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from monorepo root (../../)
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '')
  
  return {
    plugins: [react()],
    define: {
      // Expose VITE_ prefixed env vars
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    }
  }
})
