import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-pdf-worker',
      buildStart() {
        // Ensure public/libs directory exists
        const publicLibsDir = resolve(__dirname, 'public/libs')
        mkdirSync(publicLibsDir, { recursive: true })
        
        // Copy PDF worker to public directory
        const workerSrc = resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
        const workerDest = resolve(publicLibsDir, 'pdf.worker.min.js')
        
        try {
          copyFileSync(workerSrc, workerDest)
          console.log('✓ PDF worker copied to public/libs/')
        } catch (err) {
          console.warn('Warning: Could not copy PDF worker:', err)
        }
      }
    }
  ],
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
})
