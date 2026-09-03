import { Router } from 'express';
import { EmailAddress } from '../models/EmailAddress.js';
import { authenticate } from '../middleware/auth.js';
import { scopeToOwnCustomer } from '../middleware/scopeToOwnCustomer.js';
import { validate } from '../middleware/validate.js';
import {
  createEmailAddressSchema,
  updateEmailAddressSchema,
} from '../validators/emailAddressValidators.js';
import { createCrudHandlers } from '../utils/crudFactory.js';

const router = Router();
const handlers = createCrudHandlers(EmailAddress, { entityName: 'Email' });

router.use(authenticate, scopeToOwnCustomer());

router.get('/', handlers.list);
router.get('/:id', handlers.getOne);
router.post('/', validate(createEmailAddressSchema), handlers.create);
router.patch('/:id', validate(updateEmailAddressSchema), handlers.update);
router.delete('/:id', handlers.remove);

export default router;
