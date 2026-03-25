import { defineConfig } from 'vite';

const isCapacitor=process.env.CAPACITOR==='1';

export default defineConfig({
  base: isCapacitor ? './' : '/big2/',
  define: {
    'import.meta.env.ENV': JSON.stringify(process.env.ENV ?? '')
  }
});
