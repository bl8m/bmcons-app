import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listCreditLineAmountTypes } from '../controllers/creditLineAmountTypeController.js';

const router = Router();
router.use(authenticate);
router.get('/', listCreditLineAmountTypes);

export default router;
