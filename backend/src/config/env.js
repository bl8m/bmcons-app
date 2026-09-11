import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Unico .env del progetto, nella root (vedi frontend/vite.config.js per il
// suo equivalente lato Vite). In Docker le variabili arrivano già iniettate
// via env_file in docker-compose.yml, quindi qui dotenv non trova il file
// (non è montato nel container) e non fa nulla: process.env ha comunque la
// precedenza su quanto dotenv caricherebbe da un .env.
const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, '../../../.env') });

// Valida le variabili d'ambiente all'avvio: se manca qualcosa di essenziale
// l'app si ferma subito con un messaggio chiaro, invece di fallire più tardi
// in modo confuso a runtime.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().min(1, 'MONGO_URI è obbligatorio'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN è obbligatorio'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET è obbligatorio'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET è obbligatorio'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  REFRESH_COOKIE_NAME: z.string().default('refreshToken'),
  ADMIN_NAME: z.string().default('Amministratore'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Configurazione ambiente non valida:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
