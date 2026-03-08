import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  define: {
    'import.meta.env.ENV': JSON.stringify(process.env.ENV ?? '')
  }
});
