import mongoose from 'mongoose';
import { round2 } from '../utils/round2.js';
import { LoanInstallment } from './LoanInstallment.js';

const loanSchema = new mongoose.Schema(
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
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0, set: round2 },
    durationYears: { type: Number, min: 0 },
    // Per ora testo libero: diventerà un enum di valori predefiniti in seguito.
    type: { type: String, trim: true },
  },
  { timestamps: true }
);

// Le rate appartengono esclusivamente al proprio mutuo: cancellando il mutuo
// (via findOneAndDelete, usato dal crudFactory) vanno rimosse con lui.
loanSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await LoanInstallment.deleteMany({ loanId: doc._id });
  }
});

export const Loan = mongoose.model('Loan', loanSchema);
