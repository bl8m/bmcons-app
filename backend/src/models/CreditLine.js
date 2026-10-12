import mongoose from 'mongoose';
import { round2 } from '../utils/round2.js';
import { CREDIT_LINE_AMOUNT_TYPES } from '../config/creditLineAmountTypes.js';

// Repeater "Importi": una riga per tipologia di importo (Fido di Cassa, SBF, ...).
const creditLineAmountSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: CREDIT_LINE_AMOUNT_TYPES },
    amount: { type: Number, required: true, min: 0, set: round2 },
  },
  { _id: true }
);

const creditLineSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      required: true,
      index: true,
    },
    creditLineTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditLineType',
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    amounts: { type: [creditLineAmountSchema], default: [] },
  },
  { timestamps: true }
);

export const CreditLine = mongoose.model('CreditLine', creditLineSchema);
