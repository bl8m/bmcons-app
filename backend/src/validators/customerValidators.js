import { z } from 'zod';
import { optionalString, optionalObjectId } from './common.js';

export const createCustomerSchema = z.object({
  userId: optionalObjectId(),
  companyName: z.string().trim().min(1, 'Ragione sociale obbligatoria'),
  vatNumber: optionalString(),
  taxCode: optionalString(),
  legalRepresentativeFirstName: optionalString(),
  legalRepresentativeLastName: optionalString(),
  legalRepresentativeTaxCode: optionalString(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// Auto-gestione (customer sul proprio profilo): non può cambiare il
// collegamento al proprio account di accesso.
export const updateOwnCustomerSchema = createCustomerSchema.omit({ userId: true }).partial();
