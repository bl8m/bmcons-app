// Crea l'utente amministratore iniziale a partire dalle variabili
// ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD, se non esiste già.
// Uso: npm run seed (dal container backend o in locale con MONGO_URI raggiungibile)
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { hashPassword } from '../services/authService.js';
import mongoose from 'mongoose';

async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.error('❌ ADMIN_EMAIL e ADMIN_PASSWORD devono essere impostati nel .env');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: env.ADMIN_EMAIL });
  if (existing) {
    console.log(`ℹ️  L'utente amministratore ${env.ADMIN_EMAIL} esiste già, nessuna azione.`);
  } else {
    const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
    await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: 'administrator',
    });
    console.log(`✅ Utente amministratore creato: ${env.ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
}

seedAdmin().catch((error) => {
  console.error('❌ Seed fallito:', error);
  process.exit(1);
});
