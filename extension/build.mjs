import { build } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build content script as IIFE
await build({
  plugins: [preact()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/content/inject.ts'),
      name: 'TABULAContent',
      formats: ['iife'],
      fileName: () => 'content/inject.js'
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        assetFileNames: 'content/styles.css'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});

// Build other scripts as ES modules
await build({
  plugins: [
    preact(),
    viteStaticCopy({
      targets: [
        { src: 'public/manifest.json', dest: '.' },
        { src: 'public/*.png', dest: '.' },
        { src: 'src/popup/popup.html', dest: 'popup' },
        { src: 'src/options/options.html', dest: 'options' }
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
        options: resolve(__dirname, 'src/options/options.tsx')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const baseName = chunkInfo.name;
          if (baseName === 'background') return 'background/index.js';
          if (baseName === 'popup') return 'popup/popup.js';
          if (baseName === 'options') return 'options/options.js';
          return '[name].js';
        },
        chunkFileNames: 'shared/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.includes('popup')) return 'popup/popup.css';
          if (assetInfo.name?.includes('options')) return 'options/options.css';
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

console.log('Build complete!');