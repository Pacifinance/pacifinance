import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              displayName: true,
              fileName: false
            }
          ]
        ]
      }
    })
  ],
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    outDir: 'build'
  },
  define: {
    'process.env': 'import.meta.env'
  }
})
