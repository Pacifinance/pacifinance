import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Mirror path aliases from src/tsconfig.json — single source of truth.
    tsconfigPaths({ projects: ['./src/tsconfig.json'] }),
    // Tailwind v4: this plugin replaces postcss.config.js entirely.
    tailwindcss(),
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
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk for the main React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Chunk for chart libraries (very heavy)
          'charts': ['recharts'],
          // Chunk for icons (very heavy)
          'icons': ['react-icons'],
          // Chunk for styled-components
          'styled': ['styled-components'],
          // Chunk for UI utilities
          'ui-utils': ['react-calendar', 'react-csv', 'dom-to-image'],
          // ExcelJS is loaded via import() only when Excel export/import is needed.
          'excel': ['exceljs'],
          // Chunk for Emotion (if used)
          'emotion': ['@emotion/react', '@emotion/styled']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Raise the limit to avoid warnings
    sourcemap: false, // Disabled in production — no source maps served to users
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Removes console.log in production
        drop_debugger: true
      }
    }
  },
  define: {
    'process.env': 'import.meta.env'
  }
})
