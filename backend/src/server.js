import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { app } from './app.js';
import { ensureAdminUser } from './seed/ensureAdminUser.js';

async function start() {
  await connectDB();

  // Idempotente: crea l'amministratore iniziale solo se non esiste già,
  // utile soprattutto al primo avvio su un ambiente con database vuoto
  // (es. un nuovo deploy) dove eseguire "npm run seed" a mano non è comodo.
  const seedResult = await ensureAdminUser();
  if (seedResult.created) {
    console.log(`✅ Utente amministratore iniziale creato (${env.ADMIN_EMAIL})`);
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Backend in ascolto su http://localhost:${env.PORT}`);
  });
}

start();
