import fs from 'node:fs/promises';
import { Attachment } from '../models/Attachment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { attachmentAbsolutePath } from '../services/attachmentService.js';

export const listAttachments = asyncHandler(async (req, res) => {
  const { attachableType, attachableId } = req.query;
  if (!attachableType || !attachableId) {
    throw new ApiError(400, 'attachableType e attachableId sono obbligatori');
  }

  const items = await Attachment.find({ attachableType, attachableId }).sort({ createdAt: -1 });
  res.json({ items });
});

export const createAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Nessun file ricevuto (campo "file")');
  }

  const { attachableType, attachableId, name, version } = req.body;

  const item = await Attachment.create({
    attachableType,
    attachableId,
    localPath: req.file.filename,
    originalFilename: req.file.originalname,
    name: name || req.file.originalname,
    version,
  });

  res.status(201).json({ item });
});

export const downloadAttachment = asyncHandler(async (req, res) => {
  const attachment = await Attachment.findById(req.params.id);
  if (!attachment) throw new ApiError(404, 'Allegato non trovato');

  res.download(attachmentAbsolutePath(attachment.localPath), attachment.originalFilename, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ message: 'File non trovato su disco' });
    }
  });
});

export const deleteAttachment = asyncHandler(async (req, res) => {
  const attachment = await Attachment.findByIdAndDelete(req.params.id);
  if (!attachment) throw new ApiError(404, 'Allegato non trovato');

  // Se il file manca già su disco non è un errore bloccante per la
  // cancellazione del record.
  await fs.unlink(attachmentAbsolutePath(attachment.localPath)).catch(() => {});

  res.status(204).send();
});
