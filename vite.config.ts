
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Definimos solo las variables necesarias para evitar errores de Rollup
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.MONGODB_URI': JSON.stringify(process.env.MONGODB_URI),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@google/genai'],
          utils: ['jspdf', 'jspdf-autotable', 'recharts']
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true
  }
});
