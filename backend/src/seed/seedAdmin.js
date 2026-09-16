// Crea l'utente amministratore iniziale a partire dalle variabili
// ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD, se non esiste già.
// Uso: npm run seed (dal container backend o in locale con MONGO_URI raggiungibile)
//
// Nota: la stessa identica logica viene eseguita anche automaticamente ad
// ogni avvio del server (vedi server.js + ensureAdminUser.js), quindi questo
// script serve soprattutto per crearlo "a comando" senza aspettare un
// riavvio, o per rieseguirlo manualmente.
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { ensureAdminUser } from './ensureAdminUser.js';
import mongoose from 'mongoose';

async function run() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.error('❌ ADMIN_EMAIL e ADMIN_PASSWORD devono essere impostati nel .env');
    process.exit(1);
  }

  await connectDB();

  const result = await ensureAdminUser();
  if (result.created) {
    console.log(`✅ Utente amministratore creato: ${env.ADMIN_EMAIL}`);
  } else {
    console.log(`ℹ️  Nessuna azione: ${result.reason}.`);
  }

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error('❌ Seed fallito:', error);
  process.exit(1);
});
