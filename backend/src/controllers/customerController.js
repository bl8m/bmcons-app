import { Customer } from '../models/Customer.js';
import { Address } from '../models/Address.js';
import { Phone } from '../models/Phone.js';
import { EmailAddress } from '../models/EmailAddress.js';
import { BankAccount } from '../models/BankAccount.js';
import { Loan } from '../models/Loan.js';
import { LoanInstallment } from '../models/LoanInstallment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// --- Gestione amministratore (tutti i clienti) ---

export const listCustomers = asyncHandler(async (_req, res) => {
  const items = await Customer.find().sort({ createdAt: -1 });
  res.json({ items });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Cliente non trovato');
  res.json({ item });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.create(req.body);
  res.status(201).json({ item });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new ApiError(404, 'Cliente non trovato');
  res.json({ item });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, 'Cliente non trovato');

  // I dati collegati (indirizzi, telefoni, mutui, ...) appartengono
  // esclusivamente a questo cliente: vanno rimossi insieme a lui. deleteMany
  // non innesca l'hook di cascade del modello Loan, quindi le rate dei suoi
  // mutui vanno cancellate esplicitamente qui.
  const loanIds = await Loan.find({ customerId: item._id }).distinct('_id');

  await Promise.all([
    Address.deleteMany({ customerId: item._id }),
    Phone.deleteMany({ customerId: item._id }),
    EmailAddress.deleteMany({ customerId: item._id }),
    BankAccount.deleteMany({ customerId: item._id }),
    Loan.deleteMany({ customerId: item._id }),
    LoanInstallment.deleteMany({ loanId: { $in: loanIds } }),
  ]);

  res.status(204).send();
});

// --- Auto-gestione (customer sul proprio profilo) ---

export const getOwnCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findOne({ userId: req.user.id });
  res.json({ item }); // null se nessun profilo è ancora stato collegato
});

export const updateOwnCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findOneAndUpdate({ userId: req.user.id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new ApiError(404, 'Nessun profilo associato al tuo account');
  res.json({ item });
});
