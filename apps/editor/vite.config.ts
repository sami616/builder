import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  build: {
    target: 'esnext',
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 5173,
  },
  plugins: [
    ,
    TanStackRouterVite(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
}))
