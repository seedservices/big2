import { defineConfig } from 'vite';

export default defineConfig({
  base: '/big2/',
  define: {
    'import.meta.env.ENV': JSON.stringify(process.env.ENV ?? '')
  }
});
