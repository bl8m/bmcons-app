import { Router } from 'express';
import { CreditLine } from '../models/CreditLine.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { scopeToOwnCustomer } from '../middleware/scopeToOwnCustomer.js';
import { validate } from '../middleware/validate.js';
import { createCreditLineSchema, updateCreditLineSchema } from '../validators/creditLineValidators.js';
import { createCrudHandlers } from '../utils/crudFactory.js';

const router = Router();
const handlers = createCrudHandlers(CreditLine, { entityName: 'Affidamento' });

// L'affidamento ha un customerId diretto: stesso middleware di scoping usato
// per i mutui. Lettura condivisa (il customer vede solo i propri
// affidamenti), scrittura riservata all'administrator.
router.use(authenticate, scopeToOwnCustomer());

router.get('/', handlers.list);
router.get('/:id', handlers.getOne);
router.post('/', requireRole('administrator'), validate(createCreditLineSchema), handlers.create);
router.patch('/:id', requireRole('administrator'), validate(updateCreditLineSchema), handlers.update);
router.delete('/:id', requireRole('administrator'), handlers.remove);

export default router;
