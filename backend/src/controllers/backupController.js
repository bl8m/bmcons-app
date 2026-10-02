import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { exportDatabase, importDatabase } from '../services/backupService.js';

export const exportBackup = asyncHandler(async (req, res) => {
  const data = await exportDatabase();

  // Timestamp filesystem-safe (niente ":" ) nel nome del file.
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `bmcons-backup-${timestamp}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(JSON.stringify(data, null, 2));
});

export const importBackup = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Nessun file ricevuto (campo "file")');
  }

  let data;
  try {
    data = JSON.parse(req.file.buffer.toString('utf-8'));
  } catch {
    throw new ApiError(400, 'Il file non è un JSON valido');
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError(400, 'Formato del file non valido');
  }

  const imported = await importDatabase(data);

  if (Object.keys(imported).length === 0) {
    throw new ApiError(422, 'Il file non contiene nessuna sezione riconosciuta');
  }

  res.status(200).json({ imported });
});
