import { Router } from 'express';
import * as bankController from '../controllers/bankController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createBankSchema, updateBankSchema } from '../validators/bankValidators.js';

const router = Router();

router.use(authenticate);

// La lista è leggibile da chiunque sia autenticato: serve anche al customer
// per scegliere la banca quando registra un proprio conto corrente.
router.get('/', bankController.listBanks);

// Scrittura riservata all'administrator: le banche sono un elenco di
// riferimento condiviso, non un dato di proprietà del singolo cliente.
router.use(requireRole('administrator'));
router.get('/:id', bankController.getBank);
router.post('/', validate(createBankSchema), bankController.createBank);
router.patch('/:id', validate(updateBankSchema), bankController.updateBank);
router.delete('/:id', bankController.deleteBank);

export default router;
