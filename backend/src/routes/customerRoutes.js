import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  updateOwnCustomerSchema,
} from '../validators/customerValidators.js';

const router = Router();

router.use(authenticate);

// Auto-gestione: deve essere dichiarata prima di "/:id" per non venirne
// intercettata (Express fa match dei path nell'ordine di registrazione).
router.get('/me', customerController.getOwnCustomer);
router.patch('/me', validate(updateOwnCustomerSchema), customerController.updateOwnCustomer);

// Gestione completa: solo administrator.
router.use(requireRole('administrator'));
router.get('/', customerController.listCustomers);
router.get('/:id', customerController.getCustomer);
router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.patch('/:id', validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
