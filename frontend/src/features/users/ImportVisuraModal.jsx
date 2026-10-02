import { useState } from 'react';
import Modal from '../../components/Modal.jsx';
import Button from '../../components/Button.jsx';

// Solo interfaccia per ora: la chiamata reale a Claude per estrarre i dati
// dalla visura camerale verrà collegata quando saranno definiti i campi
// dell'anagrafica utente da popolare con i dati estratti.
export default function ImportVisuraModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setFile(null);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importa visura">
      {submitted ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text">
            L'importazione automatica non è ancora attiva: prima vanno definiti i campi
            dell'anagrafica utente da popolare con i dati estratti dalla visura.
          </p>
          <div className="flex justify-end">
            <Button type="button" onClick={handleClose}>
              Chiudi
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-text">
            Carica il PDF della visura camerale: i dati verranno estratti automaticamente da
            Claude e usati per precompilare la scheda utente.
          </p>

          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm text-text-dark file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-text-dark hover:file:bg-gray-200"
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={!file}>
              Importa
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
