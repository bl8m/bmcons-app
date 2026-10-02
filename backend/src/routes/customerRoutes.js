import { Router } from 'express';
import multer from 'multer';
import * as customerController from '../controllers/customerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  updateOwnCustomerSchema,
} from '../validators/customerValidators.js';

// In memoria: il PDF viene inoltrato direttamente a Claude, non persistito
// (a meno che l'utente scelga separatamente di salvarlo tra gli allegati).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 }, // 32MB, limite richiesta base64 dell'API Anthropic
});

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

// Importazione visura camerale via Claude: crea un nuovo cliente con i dati
// estratti dal documento, più indirizzi/telefoni/email collegati.
// L'aggiornamento di un cliente già esistente verrà aggiunto in seguito.
router.post('/import-visura', upload.single('file'), customerController.importVisura);

// Scadenzario mutui del cliente: stessa funzione wrapper per tabella a
// video ed export XLSX (vedi services/loanReportService.js).
router.get('/:id/loan-report', customerController.getLoanScheduleReport);
router.get('/:id/loan-report/export', customerController.exportLoanScheduleReport);

export default router;
