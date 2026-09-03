import { BankAccount } from '../models/BankAccount.js';
import { Bank } from '../models/Bank.js';
import { createCrudHandlers } from '../utils/crudFactory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const handlers = createCrudHandlers(BankAccount, { entityName: 'Conto corrente' });

export const listBankAccounts = handlers.list;
export const getBankAccount = handlers.getOne;
export const updateBankAccount = handlers.update;
export const removeBankAccount = handlers.remove;

// Verifica che la banca indicata esista prima di creare/aggiornare il conto.
export const ensureBankExists = asyncHandler(async (req, _res, next) => {
  if (req.body.bankId) {
    const exists = await Bank.exists({ _id: req.body.bankId });
    if (!exists) throw new ApiError(400, 'Banca non valida');
  }
  next();
});

export const createBankAccount = handlers.create;
