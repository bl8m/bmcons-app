import { z } from 'zod';

// Schema generico di esempio per l'estrazione di tabelle da PDF.
// Da sostituire/estendere con schemi specifici per ogni tipo di documento
// una volta definite le entità di dominio.
export const genericTableSchema = z.object({
  tables: z.array(
    z.object({
      title: z.string().nullable().describe('Titolo o descrizione della tabella, se presente'),
      columns: z.array(z.string()).describe('Intestazioni delle colonne'),
      rows: z.array(z.array(z.string())).describe('Righe della tabella, valori come stringhe'),
    })
  ),
});
