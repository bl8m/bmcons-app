import mongoose from 'mongoose';

const creditLineTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

export const CreditLineType = mongoose.model('CreditLineType', creditLineTypeSchema);
