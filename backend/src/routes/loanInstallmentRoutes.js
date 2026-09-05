import { Router } from 'express';
import { LoanInstallment } from '../models/LoanInstallment.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { scopeToOwnLoanInstallments } from '../middleware/scopeToOwnLoanInstallments.js';
import { validate } from '../middleware/validate.js';
import {
  createLoanInstallmentSchema,
  updateLoanInstallmentSchema,
} from '../validators/loanInstallmentValidators.js';
import { createCrudHandlers } from '../utils/crudFactory.js';

const router = Router();
// Ordinate per scadenza (non per data di inserimento): è l'ordine naturale
// di un piano di ammortamento. number come criterio secondario in caso di
// scadenze coincidenti.
const handlers = createCrudHandlers(LoanInstallment, {
  entityName: 'Rata mutuo',
  sort: { dueDate: 1, number: 1 },
});

router.use(authenticate, scopeToOwnLoanInstallments());

router.get('/', handlers.list);
router.get('/:id', handlers.getOne);
router.post(
  '/',
  requireRole('administrator'),
  validate(createLoanInstallmentSchema),
  handlers.create
);
router.patch(
  '/:id',
  requireRole('administrator'),
  validate(updateLoanInstallmentSchema),
  handlers.update
);
router.delete('/:id', requireRole('administrator'), handlers.remove);

export default router;
