import { z } from 'zod';

export const createEmailAddressSchema = z.object({
  customerId: z.string().trim().min(1, 'Cliente obbligatorio'),
  label: z.string().trim().min(1, 'Etichetta obbligatoria'),
  email: z.string().trim().email('Email non valida'),
  isPrimary: z.boolean().optional().default(false),
});

export const updateEmailAddressSchema = createEmailAddressSchema.partial();
