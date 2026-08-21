import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      { find: '@/src', replacement: path.resolve(__dirname, 'src') },
      { find: '@/components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: 'next/link', replacement: path.resolve(__dirname, 'src/shims/next-link.jsx') },
      { find: 'next/image', replacement: path.resolve(__dirname, 'src/shims/next-image.jsx') },
      { find: 'next/navigation', replacement: path.resolve(__dirname, 'src/shims/next-navigation.jsx') },
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://api.lettershamper.shop',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
