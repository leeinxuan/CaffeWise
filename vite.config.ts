import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Prevent "process is not defined" error in browser by replacing the specific variable with its value
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})