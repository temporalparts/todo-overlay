import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Config for background, popup, and options pages
export default defineConfig({
  plugins: [
    preact(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.'
        },
        {
          src: 'public/*.png',
          dest: '.'
        },
        {
          src: 'src/popup/popup.html',
          dest: 'popup'
        },
        {
          src: 'src/options/options.html',
          dest: 'options'
        },
        {
          src: 'public/tabula.html',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        popup: resolve(__dirname, 'src/popup/popup.tsx'),
        options: resolve(__dirname, 'src/options/options.tsx'),
        tabula: resolve(__dirname, 'src/tabula/index.tsx')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const baseName = chunkInfo.name;
          if (baseName === 'background') return 'background/index.js';
          if (baseName === 'popup') return 'popup/popup.js';
          if (baseName === 'options') return 'options/options.js';
          if (baseName === 'tabula') return 'tabula/index.js';
          return '[name].js';
        },
        chunkFileNames: 'shared/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            if (assetInfo.name.includes('popup')) return 'popup/popup.css';
            if (assetInfo.name.includes('options')) return 'options/options.css';
            if (assetInfo.name.includes('tabula')) return 'tabula/tabula.css';
            return 'assets/[name][extname]';
          }
          return 'assets/[name][extname]';
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});