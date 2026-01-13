
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Provee process.env al navegador para que funcionen las llamadas a la API de Gemini y DB
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false
  }
});
