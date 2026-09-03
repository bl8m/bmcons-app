import mongoose from 'mongoose';
import { exclusivePrimaryPlugin } from './plugins/exclusivePrimary.js';

const addressSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true },
    province: { type: String, trim: true },
    country: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.plugin(exclusivePrimaryPlugin, { scopeField: 'customerId' });

export const Address = mongoose.model('Address', addressSchema);
