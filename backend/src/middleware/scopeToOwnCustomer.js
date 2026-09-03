import { Customer } from '../models/Customer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// Middleware per le entità figlie di Cliente (indirizzi, telefoni, email,
// conti correnti), condivise tra amministratori e customer:
// - administrator: nessuna restrizione; può filtrare opzionalmente con
//   ?customerId=... (es. per vedere solo i dati di un cliente).
// - customer: forza lo scoping al proprio cliente collegato, sia in lettura
//   (req.resourceFilter) sia in scrittura (sovrascrive req.body.customerId),
//   così non può leggere né assegnare a sé record di altri clienti.
export const scopeToOwnCustomer = () =>
  asyncHandler(async (req, _res, next) => {
    if (req.user.role === 'administrator') {
      req.resourceFilter = req.query.customerId ? { customerId: req.query.customerId } : {};
      return next();
    }

    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      throw new ApiError(403, 'Nessun profilo cliente associato al tuo account');
    }

    req.resourceFilter = { customerId: customer._id };
    if (req.body && typeof req.body === 'object') {
      req.body.customerId = customer._id.toString();
    }
    next();
  });
