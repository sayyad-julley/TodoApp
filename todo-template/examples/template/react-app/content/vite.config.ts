import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
{{#if (eq uiFramework 'tailwind')}}
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
{{/if}}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  {{#if (eq uiFramework 'tailwind')}}
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  {{/if}}
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});