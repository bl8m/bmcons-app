import { z } from 'zod';
import { optionalString } from './common.js';

export const createAddressSchema = z.object({
  // Per un utente customer viene sovrascritto automaticamente dal middleware
  // scopeToOwnCustomer, ma resta obbligatorio per le richieste amministratore.
  customerId: z.string().trim().min(1, 'Cliente obbligatorio'),
  label: z.string().trim().min(1, 'Etichetta obbligatoria'),
  street: z.string().trim().min(1, 'Indirizzo obbligatorio'),
  city: z.string().trim().min(1, 'Città obbligatoria'),
  postalCode: optionalString(),
  province: optionalString(),
  country: optionalString(),
  isPrimary: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
