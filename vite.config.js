import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylus from 'stylus';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        api: 'modern-compiler', // ou "modern", "legacy"
        importers: [
        ],
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  publicDir: 'public',
});


