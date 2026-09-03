import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { extractStructuredDataFromPdf } from '../services/anthropicService.js';
import { genericTableSchema } from '../validators/documentValidators.js';

// Endpoint dimostrativo: riceve un PDF via multipart/form-data (campo "file"),
// lo invia a Claude e restituisce le tabelle estratte come JSON.
// Il salvataggio su MongoDB verrà aggiunto quando le entità di dominio
// saranno definite (qui ci si ferma all'estrazione).
export const extractTables = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Nessun file PDF ricevuto (campo "file")');
  }

  if (req.file.mimetype !== 'application/pdf') {
    throw new ApiError(400, 'Il file deve essere un PDF');
  }

  const data = await extractStructuredDataFromPdf(req.file.buffer, genericTableSchema);

  res.json(data);
});
