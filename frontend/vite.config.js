import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Necessario per l'hot reload dentro Docker (con volumi montati su alcuni filesystem host)
    watch: {
      usePolling: true,
    },
  },
});
