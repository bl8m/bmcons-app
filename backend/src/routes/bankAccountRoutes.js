import { Router } from 'express';
import * as bankAccountController from '../controllers/bankAccountController.js';
import { authenticate } from '../middleware/auth.js';
import { scopeToOwnCustomer } from '../middleware/scopeToOwnCustomer.js';
import { validate } from '../middleware/validate.js';
import {
  createBankAccountSchema,
  updateBankAccountSchema,
} from '../validators/bankAccountValidators.js';

const router = Router();

router.use(authenticate, scopeToOwnCustomer());

router.get('/', bankAccountController.listBankAccounts);
router.get('/:id', bankAccountController.getBankAccount);
router.post(
  '/',
  validate(createBankAccountSchema),
  bankAccountController.ensureBankExists,
  bankAccountController.createBankAccount
);
router.patch(
  '/:id',
  validate(updateBankAccountSchema),
  bankAccountController.ensureBankExists,
  bankAccountController.updateBankAccount
);
router.delete('/:id', bankAccountController.removeBankAccount);

export default router;
