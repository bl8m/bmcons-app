import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal.jsx';
import Button from '../../components/Button.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import { importVisura } from './customersApi.js';
import { uploadAttachment } from '../attachments/attachmentsApi.js';

// Crea un nuovo cliente a partire da una visura camerale. L'aggiornamento di
// un cliente già esistente verrà aggiunto in seguito.
export default function ImportVisuraModal({ isOpen, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [saveToAttachments, setSaveToAttachments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setFile(null);
    setSaveToAttachments(false);
    setResult(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const importResult = await importVisura(file);
      if (saveToAttachments) {
        await uploadAttachment('Customer', importResult.item._id, file);
      }
      setResult({ ...importResult, savedToAttachments: saveToAttachments });
      onImported?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Impossibile importare la visura.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importa visura">
      {result ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-green-700">
            Cliente "{result.item.companyName}" creato con successo.
          </p>
          <ul className="list-inside list-disc text-sm text-text">
            <li>Indirizzi creati: {result.addressesCreated}</li>
            <li>Telefoni creati: {result.phonesCreated}</li>
            <li>Email create: {result.emailsCreated}</li>
            {result.savedToAttachments && <li>File salvato tra gli allegati del cliente</li>}
          </ul>
          <div className="flex justify-end gap-2">
            <Link
              to={`/admin/customers/${result.item._id}`}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-gray-50"
              onClick={handleClose}
            >
              Vai alla scheda cliente
            </Link>
            <Button type="button" onClick={handleClose}>
              Chiudi
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-text">
            Carica il PDF della visura camerale: verrà creato automaticamente un nuovo cliente con
            i dati estratti (anagrafica, soci, amministratori, sede legale, telefoni ed email).
          </p>

          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm text-text-dark file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-text-dark hover:file:bg-gray-200"
          />

          <Checkbox
            id="save-to-attachments"
            label="Salva negli allegati"
            checked={saveToAttachments}
            onChange={(event) => setSaveToAttachments(event.target.checked)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={!file} isLoading={isSaving}>
              Importa
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
