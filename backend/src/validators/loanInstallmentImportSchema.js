import { z } from 'zod';

// Schema per l'estrazione strutturata via Claude (piano di ammortamento PDF).
// Tipi volutamente "piatti" (stringhe/numeri, niente Date): sono quelli che
// il modello può popolare in uno JSON Schema. La normalizzazione verso i
// tipi reali del DB (Date, arrotondamento a 2 decimali, default) avviene
// dopo, passando i dati per createLoanInstallmentSchema.
export const loanInstallmentImportSchema = z.object({
  installments: z.array(
    z.object({
      number: z.number().int().describe('Numero progressivo della rata'),
      dueDate: z.string().describe('Data di scadenza della rata, in formato YYYY-MM-DD'),
      amount: z.number().describe('Importo totale della rata'),
      principalAmount: z.number().describe('Quota capitale della rata'),
      interestAmount: z.number().describe('Quota interessi della rata'),
      remainingDebt: z.number().describe('Debito residuo dopo il pagamento della rata'),
      fees: z
        .number()
        .optional()
        .describe('Eventuali oneri o spese aggiuntive della rata, se presenti nel documento'),
    })
  ),
});
