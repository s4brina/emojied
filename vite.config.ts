import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/emojied', // <-- make sure this matches your repo name
  plugins: [react()],
});
