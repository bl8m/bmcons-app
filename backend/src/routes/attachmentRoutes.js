import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAttachmentSchema } from '../validators/attachmentValidators.js';
import { ATTACHMENTS_DIR } from '../services/attachmentService.js';
import * as attachmentController from '../controllers/attachmentController.js';

// Su disco invece che in memoria: gli allegati vanno persistiti, non solo
// inoltrati altrove come i PDF per l'estrazione dati. Nome rigenerato con un
// identificativo univoco, estensione originale mantenuta.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ATTACHMENTS_DIR),
  filename: (_req, file, cb) => {
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const router = Router();

// Solo administrator per ora: nessuna sezione lato customer richiede ancora
// accesso agli allegati.
router.use(authenticate, requireRole('administrator'));

router.get('/', attachmentController.listAttachments);
router.post(
  '/',
  upload.single('file'),
  validate(createAttachmentSchema),
  attachmentController.createAttachment
);
router.get('/:id/download', attachmentController.downloadAttachment);
router.delete('/:id', attachmentController.deleteAttachment);

export default router;
