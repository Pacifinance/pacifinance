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
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/tags': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/balances': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/expenses': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/rank': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/stats': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk per le librerie principali React
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Chunk per le librerie di grafici (molto pesanti)
          'charts': ['recharts'],
          // Chunk per le icone (molto pesanti)
          'icons': ['react-icons'],
          // Chunk per styled-components
          'styled': ['styled-components'],
          // Chunk per le utility UI
          'ui-utils': ['react-calendar', 'react-csv', 'dom-to-image'],
          // Chunk per Emotion (se usato)
          'emotion': ['@emotion/react', '@emotion/styled']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Aumenta il limite per evitare warning
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Rimuove console.log in produzione
        drop_debugger: true
      }
    }
  },
  define: {
    'process.env': 'import.meta.env'
  }
})
