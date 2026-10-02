import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth.js';
import { exportBackup, importBackup } from '../controllers/backupController.js';

// File in memoria: un dump JSON dell'intero DB (esclusi gli utenti) può
// essere più grande di un singolo PDF, limite generoso ma non illimitato.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const router = Router();

// Solo administrator: import/export del database è un'operazione sensibile.
router.use(authenticate, requireRole('administrator'));

router.get('/export', exportBackup);
router.post('/import', upload.single('file'), importBackup);

export default router;
