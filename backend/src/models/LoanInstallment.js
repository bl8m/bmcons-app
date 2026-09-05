import mongoose from 'mongoose';
import { round2 } from '../utils/round2.js';

const loanInstallmentSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
      index: true,
    },
    number: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0, set: round2 },
    principalAmount: { type: Number, required: true, min: 0, set: round2 },
    interestAmount: { type: Number, required: true, min: 0, set: round2 },
    remainingDebt: { type: Number, required: true, min: 0, set: round2 },
    fees: { type: Number, default: 0, min: 0, set: round2 },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Evita numeri di rata duplicati per lo stesso mutuo.
loanInstallmentSchema.index({ loanId: 1, number: 1 }, { unique: true });

export const LoanInstallment = mongoose.model('LoanInstallment', loanInstallmentSchema);
