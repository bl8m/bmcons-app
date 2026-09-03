import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword } from '../services/authService.js';

// Tutte le rotte di questo controller sono già protette da
// authenticate + requireRole('administrator') a livello di router.

export const listUsers = asyncHandler(async (_req, res) => {
  const items = await User.find().sort({ createdAt: -1 });
  res.json({ items });
});

export const getUser = asyncHandler(async (req, res) => {
  const item = await User.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Utente non trovato');
  res.json({ item });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const passwordHash = await hashPassword(password);
  const item = await User.create({ name, email, passwordHash, role });

  res.status(201).json({ item });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { password, ...rest } = req.body;
  const update = { ...rest };

  if (password) {
    update.passwordHash = await hashPassword(password);
  }

  const item = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!item) throw new ApiError(404, 'Utente non trovato');
  res.json({ item });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new ApiError(400, 'Non puoi eliminare il tuo account');
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'Utente non trovato');
  res.status(204).send();
});
