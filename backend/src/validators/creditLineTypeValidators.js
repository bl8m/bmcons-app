import { z } from 'zod';

export const createCreditLineTypeSchema = z.object({
  name: z.string().trim().min(1, 'Nome obbligatorio'),
});

export const updateCreditLineTypeSchema = createCreditLineTypeSchema.partial();
