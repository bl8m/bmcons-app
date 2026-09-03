import { z } from 'zod';
import { optionalString } from './common.js';

// Formato IBAN generico (non solo italiano): 2 lettere nazione + 2 cifre di
// controllo + 10-30 caratteri alfanumerici. Spazi e minuscole vengono
// normalizzati prima della validazione.
const IBAN_PATTERN = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

const ibanField = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s+/g, '').toUpperCase())
  .refine((value) => IBAN_PATTERN.test(value), 'IBAN non valido');

export const createBankAccountSchema = z.object({
  bankId: z.string().trim().min(1, 'Banca obbligatoria'),
  customerId: z.string().trim().min(1, 'Cliente obbligatorio'),
  label: z.string().trim().min(1, 'Etichetta obbligatoria'),
  iban: ibanField,
  branch: optionalString(),
  notes: optionalString(),
});

export const updateBankAccountSchema = createBankAccountSchema.partial();
