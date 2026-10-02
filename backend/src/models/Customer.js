import mongoose from 'mongoose';
import { round2 } from '../utils/round2.js';

const personSchemaFields = {
  lastName: { type: String, trim: true },
  firstName: { type: String, trim: true },
  taxCode: { type: String, trim: true },
};

// Repeater "Soci": un record per socio, con la propria quota di partecipazione.
const shareholderSchema = new mongoose.Schema(
  { ...personSchemaFields, share: { type: String, trim: true } },
  { _id: true }
);

// Repeater "Amministratori": un record per amministratore, con la carica ricoperta.
const administratorSchema = new mongoose.Schema(
  { ...personSchemaFields, role: { type: String, trim: true } },
  { _id: true }
);

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

    // --- Dettagli (dati tipicamente presenti in una visura camerale) ---
    subscribedShareCapital: {
      type: Number,
      min: 0,
      set: round2,
    },
    businessStartDate: {
      type: Date,
    },
    administrationSystem: {
      type: String,
      trim: true,
    },
    businessActivity: {
      type: String,
      trim: true,
    },
    shareholders: {
      type: [shareholderSchema],
      default: [],
    },
    administrators: {
      type: [administratorSchema],
      default: [],
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
