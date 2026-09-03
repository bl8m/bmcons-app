import mongoose from 'mongoose';

const bankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

export const Bank = mongoose.model('Bank', bankSchema);
