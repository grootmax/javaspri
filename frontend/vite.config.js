import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Optional: Configure proxy for API requests during development
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:5000', // Your backend server URL
  //       changeOrigin: true,
  //       // rewrite: (path) => path.replace(/^\/api/, '') // Optional: if you need to rewrite path
  //     }
  //   }
  // }
})
