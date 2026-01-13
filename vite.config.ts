
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Definición segura para evitar que Rollup falle al intentar serializar el objeto process completo
    'process.env': '({})',
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.MONGODB_URI': JSON.stringify(process.env.MONGODB_URI)
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false
  }
});
