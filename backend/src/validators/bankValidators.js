import { z } from 'zod';

export const createBankSchema = z.object({
  name: z.string().trim().min(1, 'Nome obbligatorio'),
});

export const updateBankSchema = createBankSchema.partial();
