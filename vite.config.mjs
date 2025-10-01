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
    postcss: './postcss.config.js',
    devSourcemap: false, // Disabilita sourcemaps CSS in produzione
    preprocessorOptions: {
      // Ottimizzazioni per preprocessori CSS se utilizzati
      scss: {
        charset: false
      }
    }
  },
  build: {
    outDir: 'build',
    sourcemap: false, // Disabilita sourcemaps in produzione per ridurre dimensioni
    rollupOptions: {
      output: {
        // Strategia di chunking ottimizzata
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          
          // Charts library (very heavy - separate chunk)
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Icon libraries (heavy - separate chunks by usage)
          if (id.includes('react-icons')) {
            return 'icons';
          }
          if (id.includes('@fortawesome') || id.includes('lucide-react')) {
            return 'icons-misc';
          }
          
          // Styling libraries
          if (id.includes('styled-components')) {
            return 'styled';
          }
          if (id.includes('@emotion')) {
            return 'emotion';
          }
          
          // UI utilities
          if (id.includes('react-calendar') || id.includes('react-csv') || id.includes('dom-to-image')) {
            return 'ui-utils';
          }
          
          // MUI components (if used heavily)
          if (id.includes('@mui')) {
            return 'mui';
          }
          
          // HTTP client
          if (id.includes('axios')) {
            return 'http';
          }
          
          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // Ottimizzazione nomi file per caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      
      // Tree shaking ottimizzato
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    
    // Configurazione minifier ottimizzata
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Rimuove console.log in produzione
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2, // Multiple passes per migliore compressione
        dead_code: true,
        unused: true,
        reduce_vars: true,
        collapse_vars: true
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/ // Mangle proprietà private che iniziano con _
        }
      },
      format: {
        comments: false // Rimuove tutti i commenti
      }
    },
    
    // Chunk size warning più restrittivo per incoraggiare chunking
    chunkSizeWarningLimit: 500,
    
    // Rollup options per ottimizzazioni avanzate
    assetsInlineLimit: 4096, // Inline assets sotto i 4KB come base64
  },
  define: {
    'process.env': 'import.meta.env'
  }
})
