import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Unico .env del progetto, nella root (vedi backend/src/config/env.js per
  // il suo equivalente lato backend): in sviluppo senza Docker Vite legge le
  // variabili VITE_* da lì invece che da frontend/.env. In Docker le
  // variabili arrivano comunque già iniettate via env_file in
  // docker-compose.yml, quindi questo vale solo per "npm run dev" locale.
  envDir: path.resolve(currentDir, '..'),
  server: {
    port: 5173,
    // Necessario per l'hot reload dentro Docker (con volumi montati su alcuni filesystem host)
    watch: {
      usePolling: true,
    },
  },
});
