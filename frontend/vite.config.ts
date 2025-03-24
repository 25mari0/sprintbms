import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 3000,
    host: true, // Allows access from outside localhost (e.g., Docker network)
  },
});
