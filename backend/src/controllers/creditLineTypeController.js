import { CreditLineType } from '../models/CreditLineType.js';
import { CreditLine } from '../models/CreditLine.js';
import { createCrudHandlers } from '../utils/crudFactory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const handlers = createCrudHandlers(CreditLineType, { entityName: 'Tipo di affidamento' });

export const listCreditLineTypes = handlers.list;
export const getCreditLineType = handlers.getOne;
export const createCreditLineType = handlers.create;
export const updateCreditLineType = handlers.update;

// Cancellazione con controllo: un tipo referenziato da affidamenti esistenti
// non può essere eliminato (evita riferimenti orfani).
export const deleteCreditLineType = asyncHandler(async (req, res) => {
  const usedByCreditLines = await CreditLine.exists({ creditLineTypeId: req.params.id });

  if (usedByCreditLines) {
    throw new ApiError(
      409,
      'Impossibile eliminare: il tipo di affidamento è utilizzato da uno o più affidamenti'
    );
  }

  const creditLineType = await CreditLineType.findByIdAndDelete(req.params.id);
  if (!creditLineType) throw new ApiError(404, 'Tipo di affidamento non trovato');
  res.status(204).send();
});
