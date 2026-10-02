import { z } from 'zod';
import { optionalString, optionalObjectId, optionalNumber, optionalDate } from './common.js';

const shareholderSchema = z.object({
  lastName: optionalString(),
  firstName: optionalString(),
  taxCode: optionalString(),
  share: optionalString(),
});

const administratorSchema = z.object({
  lastName: optionalString(),
  firstName: optionalString(),
  taxCode: optionalString(),
  role: optionalString(),
});

export const createCustomerSchema = z.object({
  userId: optionalObjectId(),
  companyName: z.string().trim().min(1, 'Ragione sociale obbligatoria'),
  vatNumber: optionalString(),
  taxCode: optionalString(),
  legalRepresentativeFirstName: optionalString(),
  legalRepresentativeLastName: optionalString(),
  legalRepresentativeTaxCode: optionalString(),

  // Dettagli (dati tipicamente presenti in una visura camerale)
  subscribedShareCapital: optionalNumber(),
  businessStartDate: optionalDate(),
  administrationSystem: optionalString(),
  businessActivity: optionalString(),
  shareholders: z.array(shareholderSchema).optional(),
  administrators: z.array(administratorSchema).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// Auto-gestione (customer sul proprio profilo): non può cambiare il
// collegamento al proprio account di accesso.
export const updateOwnCustomerSchema = createCustomerSchema.omit({ userId: true }).partial();
