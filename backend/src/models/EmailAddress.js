import mongoose from 'mongoose';
import { exclusivePrimaryPlugin } from './plugins/exclusivePrimary.js';

const emailAddressSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

emailAddressSchema.plugin(exclusivePrimaryPlugin, { scopeField: 'customerId' });

export const EmailAddress = mongoose.model('EmailAddress', emailAddressSchema);
