import { Router } from 'express';
import multer from 'multer';
import * as documentController from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';

// File in memoria (non su disco): vengono inoltrati direttamente a Claude
// e non c'è bisogno di persisterli localmente.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 }, // 32MB, limite richiesta base64 dell'API Anthropic
});

const router = Router();

// Sia administrator che customer possono importare i propri documenti.
router.post('/extract', authenticate, upload.single('file'), documentController.extractTables);

export default router;
