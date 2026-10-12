import { Router } from 'express';
import * as creditLineTypeController from '../controllers/creditLineTypeController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCreditLineTypeSchema,
  updateCreditLineTypeSchema,
} from '../validators/creditLineTypeValidators.js';

const router = Router();

router.use(authenticate);

// La lista è leggibile da chiunque sia autenticato: serve anche al form
// "Affidamento" per popolare la select del tipo.
router.get('/', creditLineTypeController.listCreditLineTypes);

// Scrittura riservata all'administrator: i tipi di affidamento sono un
// elenco di riferimento condiviso, non un dato di proprietà del cliente.
router.use(requireRole('administrator'));
router.get('/:id', creditLineTypeController.getCreditLineType);
router.post('/', validate(createCreditLineTypeSchema), creditLineTypeController.createCreditLineType);
router.patch('/:id', validate(updateCreditLineTypeSchema), creditLineTypeController.updateCreditLineType);
router.delete('/:id', creditLineTypeController.deleteCreditLineType);

export default router;
