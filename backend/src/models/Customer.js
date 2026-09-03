import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    // Collegamento facoltativo all'account di accesso (User con role "customer").
    // null = nessun account collegato. Il campo resta "null" (non assente) così
    // l'indice unico parziale sotto può escludere esplicitamente questi valori.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    vatNumber: {
      type: String,
      trim: true,
    },
    taxCode: {
      type: String,
      trim: true,
    },
    legalRepresentativeFirstName: {
      type: String,
      trim: true,
    },
    legalRepresentativeLastName: {
      type: String,
      trim: true,
    },
    legalRepresentativeTaxCode: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Unicità solo tra i documenti che hanno effettivamente un userId (ObjectId):
// un indice "sparse" classico escluderebbe solo i campi assenti, non quelli
// esplicitamente null, e con molti clienti non collegati romperebbe l'unicità.
customerSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } }
);

export const Customer = mongoose.model('Customer', customerSchema);
