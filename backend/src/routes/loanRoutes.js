import { Router } from 'express';
import multer from 'multer';
import { Loan } from '../models/Loan.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { scopeToOwnCustomer } from '../middleware/scopeToOwnCustomer.js';
import { validate } from '../middleware/validate.js';
import { createLoanSchema, updateLoanSchema } from '../validators/loanValidators.js';
import { createCrudHandlers } from '../utils/crudFactory.js';
import { importInstallmentsFromPdf } from '../controllers/loanImportController.js';

const router = Router();
const handlers = createCrudHandlers(Loan, { entityName: 'Mutuo' });

// File in memoria: viene inoltrato direttamente a Claude, non serve persisterlo su disco.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 }, // 32MB, limite richiesta base64 dell'API Anthropic
});

// Il mutuo ha un customerId diretto: stesso middleware di scoping usato per
// indirizzi/telefoni/email/conti correnti. Lettura condivisa (il customer
// vede solo i propri mutui), scrittura riservata all'administrator.
router.use(authenticate, scopeToOwnCustomer());

router.get('/', handlers.list);
router.get('/:id', handlers.getOne);
router.post('/', requireRole('administrator'), validate(createLoanSchema), handlers.create);
router.patch('/:id', requireRole('administrator'), validate(updateLoanSchema), handlers.update);
router.delete('/:id', requireRole('administrator'), handlers.remove);

// Importazione rate da PDF (piano di ammortamento) via Claude — solo administrator.
router.post(
  '/:id/import-installments',
  requireRole('administrator'),
  upload.single('file'),
  importInstallmentsFromPdf
);

export default router;
