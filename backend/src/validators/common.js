import { z } from 'zod';

// Normalizza un campo di testo facoltativo: una stringa vuota (comune quando
// il valore arriva da un form) viene salvata come "assente" invece che come
// stringa vuota nel DB.
export const optionalString = () =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined));

// Come optionalString, ma per un ObjectId facoltativo (es. collegamenti tra
// entità che si possono anche rimuovere): normalizza a `null` invece che
// `undefined`, per poter esplicitamente "sganciare" il riferimento in update.
export const optionalObjectId = () =>
  z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));
