import { Router } from 'express';
import { Address } from '../models/Address.js';
import { authenticate } from '../middleware/auth.js';
import { scopeToOwnCustomer } from '../middleware/scopeToOwnCustomer.js';
import { validate } from '../middleware/validate.js';
import { createAddressSchema, updateAddressSchema } from '../validators/addressValidators.js';
import { createCrudHandlers } from '../utils/crudFactory.js';

const router = Router();
const handlers = createCrudHandlers(Address, { entityName: 'Indirizzo' });

// Condiviso tra administrator (tutti gli indirizzi) e customer (solo i propri).
router.use(authenticate, scopeToOwnCustomer());

router.get('/', handlers.list);
router.get('/:id', handlers.getOne);
router.post('/', validate(createAddressSchema), handlers.create);
router.patch('/:id', validate(updateAddressSchema), handlers.update);
router.delete('/:id', handlers.remove);

export default router;
