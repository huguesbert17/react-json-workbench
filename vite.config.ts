import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@codemirror/autocomplete',
  '@codemirror/commands',
  '@codemirror/lang-json',
  '@codemirror/language',
  '@codemirror/view',
  '@lezer/highlight',
];

export default defineConfig(({ mode }) => {
  if (mode === 'demo') {
    return {
      plugins: [react()],
      base: '/react-json-workbench/',
      build: {
        outDir: 'demo-dist',
      },
    };
  }

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs'],
        fileName: format => (format === 'es' ? 'index.js' : 'index.cjs'),
        cssFileName: 'style',
      },
      rollupOptions: {
        external,
      },
    },
  };
});
