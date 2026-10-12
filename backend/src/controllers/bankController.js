import { Bank } from '../models/Bank.js';
import { BankAccount } from '../models/BankAccount.js';
import { Loan } from '../models/Loan.js';
import { CreditLine } from '../models/CreditLine.js';
import { createCrudHandlers } from '../utils/crudFactory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const handlers = createCrudHandlers(Bank, { entityName: 'Banca' });

export const listBanks = handlers.list;
export const getBank = handlers.getOne;
export const createBank = handlers.create;
export const updateBank = handlers.update;

// Cancellazione con controllo: una banca referenziata da conti correnti,
// mutui o affidamenti esistenti non può essere eliminata (evita riferimenti
// orfani).
export const deleteBank = asyncHandler(async (req, res) => {
  const [usedByAccounts, usedByLoans, usedByCreditLines] = await Promise.all([
    BankAccount.exists({ bankId: req.params.id }),
    Loan.exists({ bankId: req.params.id }),
    CreditLine.exists({ bankId: req.params.id }),
  ]);

  if (usedByAccounts || usedByLoans || usedByCreditLines) {
    throw new ApiError(
      409,
      'Impossibile eliminare: la banca è utilizzata da uno o più conti correnti, mutui o affidamenti'
    );
  }

  const bank = await Bank.findByIdAndDelete(req.params.id);
  if (!bank) throw new ApiError(404, 'Banca non trovata');
  res.status(204).send();
});
