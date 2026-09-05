import { Loan } from '../models/Loan.js';
import { LoanInstallment } from '../models/LoanInstallment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { extractLoanInstallmentsFromPdf } from '../services/anthropicService.js';
import { createLoanInstallmentSchema } from '../validators/loanInstallmentValidators.js';

// Riceve un PDF con il piano di ammortamento, lo invia a Claude e crea le
// rate estratte per il mutuo indicato. Numeri di rata già esistenti per lo
// stesso mutuo vengono saltati (indice unico loanId+number) invece di far
// fallire l'intera importazione.
export const importInstallmentsFromPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Nessun file PDF ricevuto (campo "file")');
  }
  if (req.file.mimetype !== 'application/pdf') {
    throw new ApiError(400, 'Il file deve essere un PDF');
  }

  const loan = await Loan.findById(req.params.id);
  if (!loan) throw new ApiError(404, 'Mutuo non trovato');

  const extracted = await extractLoanInstallmentsFromPdf(req.file.buffer);

  if (!extracted.installments?.length) {
    throw new ApiError(422, 'Nessuna rata individuata nel documento');
  }

  // Rivalida/normalizza ogni rata estratta con lo stesso schema usato per la
  // creazione manuale (arrotondamento a 2 decimali, conversione data, default oneri).
  const docs = extracted.installments
    .map((raw) => createLoanInstallmentSchema.safeParse({ ...raw, loanId: loan._id.toString() }))
    .filter((result) => result.success)
    .map((result) => result.data);

  if (docs.length === 0) {
    throw new ApiError(422, 'I dati estratti dal documento non sono validi');
  }

  let created = docs.length;
  try {
    await LoanInstallment.insertMany(docs, { ordered: false });
  } catch (error) {
    // Con ordered:false l'inserimento prosegue oltre i duplicati (numero
    // rata già esistente per questo mutuo); Mongoose espone i documenti
    // effettivamente inseriti su error.insertedDocs.
    created = error.insertedDocs?.length ?? 0;
  }

  res.status(201).json({
    total: extracted.installments.length,
    created,
    skipped: extracted.installments.length - created,
  });
});
