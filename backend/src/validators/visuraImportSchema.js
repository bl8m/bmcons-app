import { z } from 'zod';

// Schema per l'estrazione strutturata via Claude di una visura camerale.
// Diviso in più schemi più piccoli invece di uno unico: l'API Anthropic
// rifiuta con "Schema is too complex" uno schema con troppe strutture
// annidate/ripetute tutte insieme (verificato empiricamente). Le 3 parti
// vengono estratte con chiamate separate in parallelo sullo stesso PDF (vedi
// anthropicService.js), poi ricomposte in customerController.js.
//
// Tipi volutamente "piatti" (stringhe/numeri, niente Date): la
// normalizzazione verso i tipi reali del DB avviene a valle, nel controller.

export const visuraCompanySchema = z.object({
  companyName: z.string().optional().describe('Ragione sociale'),
  vatNumber: z.string().optional().describe('Partita IVA'),
  taxCode: z.string().optional().describe('Codice fiscale della società'),
  legalRepresentativeFirstName: z.string().optional().describe('Nome del legale rappresentante'),
  legalRepresentativeLastName: z.string().optional().describe('Cognome del legale rappresentante'),
  legalRepresentativeTaxCode: z.string().optional().describe('Codice fiscale del legale rappresentante'),
  subscribedShareCapital: z.number().optional().describe('Capitale sociale sottoscritto, in euro'),
  businessStartDate: z.string().optional().describe('Data di inizio attività, formato YYYY-MM-DD'),
  administrationSystem: z
    .string()
    .optional()
    .describe('Sistema di amministrazione (es. "Amministratore Unico", "Consiglio di Amministrazione")'),
  businessActivity: z.string().optional().describe("Descrizione estesa dell'attività svolta"),
});

const personFields = {
  lastName: z.string().optional().describe('Cognome'),
  firstName: z.string().optional().describe('Nome'),
  taxCode: z.string().optional().describe('Codice fiscale'),
};

export const visuraPeopleSchema = z.object({
  shareholders: z
    .array(z.object({ ...personFields, share: z.string().optional().describe('Quota di partecipazione') }))
    .optional()
    .describe('Elenco dei soci'),
  administrators: z
    .array(z.object({ ...personFields, role: z.string().optional().describe('Carica ricoperta') }))
    .optional()
    .describe('Elenco degli amministratori'),
});

const addressFields = {
  street: z.string().optional().describe('Via e numero civico'),
  city: z.string().optional().describe('Città'),
  postalCode: z.string().optional().describe('CAP'),
  province: z.string().optional().describe('Provincia (sigla)'),
  country: z.string().optional().describe('Stato'),
};

export const visuraContactsSchema = z.object({
  registeredOffice: z.object(addressFields).optional().describe('Sede legale della società'),
  secondaryOffices: z
    .array(z.object({ label: z.string().optional().describe('Es. "Sede operativa"'), ...addressFields }))
    .optional()
    .describe('Eventuali sedi secondarie/operative, se presenti'),
  phones: z
    .array(z.object({ label: z.string().optional(), number: z.string() }))
    .optional()
    .describe('Numeri di telefono trovati nel documento'),
  emails: z
    .array(
      z.object({
        label: z
          .string()
          .optional()
          .describe('"PEC" se l\'indirizzo è di posta elettronica certificata, altrimenti "Email"'),
        email: z.string(),
      })
    )
    .optional()
    .describe('Indirizzi email trovati nel documento (inclusa la PEC, se presente)'),
});
