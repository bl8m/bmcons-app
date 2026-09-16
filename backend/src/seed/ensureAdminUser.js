import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { hashPassword } from '../services/authService.js';

// Crea l'utente amministratore iniziale (da ADMIN_NAME/ADMIN_EMAIL/
// ADMIN_PASSWORD) se non esiste già. Idempotente: può essere richiamata ad
// ogni avvio del server senza effetti collaterali sugli avvii successivi,
// utile per gli ambienti dove non è comodo eseguire "npm run seed" a mano
// (es. primo deploy su un nuovo host senza accesso a un terminale nel
// container).
export async function ensureAdminUser() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    return { created: false, reason: 'ADMIN_EMAIL/ADMIN_PASSWORD non configurati' };
  }

  const existing = await User.findOne({ email: env.ADMIN_EMAIL });
  if (existing) {
    return { created: false, reason: 'esiste già' };
  }

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  await User.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    passwordHash,
    role: 'administrator',
  });

  return { created: true };
}
