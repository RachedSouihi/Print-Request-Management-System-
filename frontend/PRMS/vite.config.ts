import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/user/verify-email': {
        target: 'http://localhost:8081', // Le backend Spring Boot
        changeOrigin: true,
        secure: false, // Si votre backend n'utilise pas HTTPS, vous devez définir `secure: false`
      },
    },
  },
})
