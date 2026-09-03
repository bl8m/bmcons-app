import { z } from 'zod';

export const createPhoneSchema = z.object({
  customerId: z.string().trim().min(1, 'Cliente obbligatorio'),
  label: z.string().trim().min(1, 'Etichetta obbligatoria'),
  number: z.string().trim().min(1, 'Numero obbligatorio'),
  isPrimary: z.boolean().optional().default(false),
});

export const updatePhoneSchema = createPhoneSchema.partial();
