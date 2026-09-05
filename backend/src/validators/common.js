import { z } from 'zod';
import { round2 } from '../utils/round2.js';

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

// Normalizza un campo numerico facoltativo: stringa vuota, undefined, null o
// NaN (tipico di un <input type="number"> lasciato vuoto) diventano "assente"
// invece di far fallire la validazione o di essere salvati come 0.
export const optionalNumber = () =>
  z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((value) => {
      if (value === '' || value === undefined || value === null) return undefined;
      const num = Number(value);
      return Number.isNaN(num) ? undefined : num;
    });

// Come optionalNumber, ma con un valore di default (es. "oneri" = 0) quando
// il campo non è stato valorizzato, arrotondato a 2 decimali.
export const optionalMoneyWithDefault = (defaultValue = 0) =>
  optionalNumber().transform((value) => round2(value === undefined ? defaultValue : value));

// Campo numerico obbligatorio: rifiuta esplicitamente stringa vuota/NaN
// (altrimenti z.coerce.number() le trasformerebbe silenziosamente in 0).
export const requiredNumber = (message = 'Campo obbligatorio') =>
  z
    .union([z.string(), z.number()])
    .refine(
      (value) => value !== '' && value !== undefined && value !== null && !Number.isNaN(Number(value)),
      message
    )
    .transform((value) => Number(value));

// Come requiredNumber, ma arrotondato a 2 decimali (importi, quote, ...).
export const requiredMoney = (message = 'Campo obbligatorio') =>
  requiredNumber(message).transform(round2);

// Campo intero obbligatorio (es. numero rata, durata in anni).
export const requiredInteger = (message = 'Campo obbligatorio') =>
  z
    .union([z.string(), z.number()])
    .refine(
      (value) => value !== '' && value !== undefined && value !== null && Number.isInteger(Number(value)),
      message
    )
    .transform((value) => Number(value));
