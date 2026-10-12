import { asyncHandler } from '../utils/asyncHandler.js';
import { CREDIT_LINE_AMOUNT_TYPES } from '../config/creditLineAmountTypes.js';

// Elenco dei tipi di importo selezionabili in un affidamento (Fido di Cassa,
// SBF, ...). req.query.creditLineTypeId non è ancora utilizzato: in futuro
// la lista potrebbe dipendere dalla tipologia di affidamento selezionata, e
// il parametro è già accettato per non dover cambiare il contratto quando
// quella logica verrà aggiunta.
export const listCreditLineAmountTypes = asyncHandler(async (_req, res) => {
  res.json({ items: CREDIT_LINE_AMOUNT_TYPES });
});
