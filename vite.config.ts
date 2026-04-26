import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    proxy: {
      // Proxy Azure Speech Services to avoid CORS
      '/api/speech': {
        target: 'https://api.nlp.dev.uptimize.merckgroup.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/speech/, '/azure_speech_services'),
        secure: true,
      },
      // Proxy Azure OpenAI to avoid CORS
      '/api/openai': {
        target: 'https://api.nlp.dev.uptimize.merckgroup.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, '/openai'),
        secure: true,
      },
    },
  },
})
