import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tipologie di importo selezionabili in un affidamento (Fido di Cassa, SBF,
// ...). Per ora un file di configurazione statico: in futuro probabilmente
// diventerà un'entità gestita su DB (vedi anche GET /credit-line-amount-types,
// già pronto ad accettare un creditLineTypeId per filtrare in base alla
// tipologia di affidamento).
export const CREDIT_LINE_AMOUNT_TYPES = JSON.parse(
  readFileSync(path.join(__dirname, 'creditLineAmountTypes.json'), 'utf-8')
);
