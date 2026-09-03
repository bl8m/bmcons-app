import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    iban: { type: String, required: true, trim: true, uppercase: true },
    branch: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
