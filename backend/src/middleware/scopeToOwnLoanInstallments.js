import { Customer } from '../models/Customer.js';
import { Loan } from '../models/Loan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// Le rate mutuo non hanno un customerId diretto: per il customer bisogna
// prima risalire ai propri mutui e poi filtrare le rate su quegli id.
// La scrittura per il customer è comunque bloccata a livello di rotta
// (accesso in sola lettura), quindi qui serve solo lo scoping in lettura.
export const scopeToOwnLoanInstallments = () =>
  asyncHandler(async (req, _res, next) => {
    if (req.user.role === 'administrator') {
      req.resourceFilter = req.query.loanId ? { loanId: req.query.loanId } : {};
      return next();
    }

    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      throw new ApiError(403, 'Nessun profilo cliente associato al tuo account');
    }

    const loans = await Loan.find({ customerId: customer._id }).select('_id');
    req.resourceFilter = { loanId: { $in: loans.map((loan) => loan._id) } };
    next();
  });
