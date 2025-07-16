import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'out/webview',
    lib: {
      entry: resolve(__dirname, 'src/webview/index.tsx'),
      name: 'TaskitEditor',
      fileName: 'taskit-editor',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        entryFileNames: 'taskit-editor.js',
        assetFileNames: 'taskit-editor.css'
      }
    },
    minify: false,
    sourcemap: true
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"'
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
