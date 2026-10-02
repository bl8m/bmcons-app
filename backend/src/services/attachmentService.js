import fs from 'node:fs/promises';
import path from 'node:path';
import { Attachment } from '../models/Attachment.js';

// Cartella unica su disco per tutti gli allegati, indipendentemente dal tipo
// di entità a cui sono collegati. In Docker (dev) è dentro il volume
// bind-mounted di backend/, quindi persiste tra i riavvii del container.
export const ATTACHMENTS_DIR = path.resolve(process.cwd(), 'uploads', 'attachments');

export async function ensureAttachmentsDir() {
  await fs.mkdir(ATTACHMENTS_DIR, { recursive: true });
}

export function attachmentAbsolutePath(localPath) {
  return path.join(ATTACHMENTS_DIR, localPath);
}

// Cancella tutti gli allegati (record + file su disco) collegati a una
// specifica entità — da richiamare quando quell'entità viene eliminata.
export async function deleteAttachmentsFor(attachableType, attachableId) {
  const attachments = await Attachment.find({ attachableType, attachableId });

  await Promise.all(
    attachments.map((attachment) =>
      fs.unlink(attachmentAbsolutePath(attachment.localPath)).catch(() => {})
    )
  );

  await Attachment.deleteMany({ attachableType, attachableId });
}
