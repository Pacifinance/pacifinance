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
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk per le librerie principali React
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Chunk per le librerie di grafici (molto pesanti)
          'charts': ['recharts'],
          // Chunk separato per MUI icons (ottimizzazione mobile)
          'mui-icons': ['@mui/icons-material'],
          // Chunk per le icone React (molto pesanti)
          'react-icons': ['react-icons'],
          // Chunk per styled-components
          'styled': ['styled-components'],
          // Chunk per le utility UI
          'ui-utils': ['react-calendar', 'react-csv', 'dom-to-image'],
          // Chunk per Emotion (se usato)
          'emotion': ['@emotion/react', '@emotion/styled'],
          // Chunk per utilities
          'utils': ['axios', 'react-helmet']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Aumenta il limite per evitare warning
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Rimuove console.log in produzione
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'] // Rimuove specifiche funzioni console
      },
      mangle: {
        safari10: true // Fix per Safari mobile
      }
    },
    // Ottimizzazioni per mobile
    target: ['es2015', 'safari11'], // Supporto browser mobile
    sourcemap: false // Riduce dimensione bundle in produzione
  },
  define: {
    'process.env': 'import.meta.env'
  }
})
