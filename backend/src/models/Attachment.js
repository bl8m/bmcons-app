import mongoose from 'mongoose';

// Relazione polimorfica (come le morph relations di Laravel): attachableType
// identifica il tipo di entità collegata (es. "Customer"), attachableId il
// suo _id. Nessun "ref" dichiarato qui perché il modello di destinazione
// varia in base ad attachableType.
const attachmentSchema = new mongoose.Schema(
  {
    attachableType: { type: String, required: true },
    attachableId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // Nome univoco con cui il file è salvato su disco (vedi
    // services/attachmentService.js per la cartella), estensione originale
    // mantenuta. Non è un percorso assoluto: resta portabile tra ambienti.
    localPath: { type: String, required: true },

    // Nome del file prima della rinomina, usato per etichetta di default e
    // nome suggerito in download.
    originalFilename: { type: String, required: true },

    name: { type: String, required: true },
    version: { type: String, default: '' },
  },
  { timestamps: true }
);

attachmentSchema.index({ attachableType: 1, attachableId: 1 });

export const Attachment = mongoose.model('Attachment', attachmentSchema);
