import { z } from 'zod';
import { requiredMoney } from './common.js';
import { CREDIT_LINE_AMOUNT_TYPES } from '../config/creditLineAmountTypes.js';

const creditLineAmountSchema = z.object({
  type: z.enum(CREDIT_LINE_AMOUNT_TYPES, { errorMap: () => ({ message: 'Tipo non valido' }) }),
  amount: requiredMoney('Importo obbligatorio'),
});

export const createCreditLineSchema = z.object({
  customerId: z.string().trim().min(1, 'Cliente obbligatorio'),
  bankId: z.string().trim().min(1, 'Banca obbligatoria'),
  creditLineTypeId: z.string().trim().min(1, 'Tipo di affidamento obbligatorio'),
  label: z.string().trim().min(1, 'Etichetta obbligatoria'),
  amounts: z.array(creditLineAmountSchema).optional().default([]),
});

export const updateCreditLineSchema = createCreditLineSchema.partial();
