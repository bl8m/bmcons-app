import { z } from 'zod';
import { optionalString, optionalNumber, requiredMoney } from './common.js';

export const createLoanSchema = z.object({
  customerId: z.string().trim().min(1, 'Cliente obbligatorio'),
  bankId: z.string().trim().min(1, 'Banca obbligatoria'),
  label: z.string().trim().min(1, 'Etichetta obbligatoria'),
  amount: requiredMoney('Importo obbligatorio'),
  durationYears: optionalNumber(),
  // Per ora testo libero (vedi modello): diventerà un enum in seguito.
  type: optionalString(),
});

export const updateLoanSchema = createLoanSchema.partial();
