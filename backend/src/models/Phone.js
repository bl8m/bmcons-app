import mongoose from 'mongoose';
import { exclusivePrimaryPlugin } from './plugins/exclusivePrimary.js';

const phoneSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

phoneSchema.plugin(exclusivePrimaryPlugin, { scopeField: 'customerId' });

export const Phone = mongoose.model('Phone', phoneSchema);
