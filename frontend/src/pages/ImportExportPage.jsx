import { useState } from 'react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { exportBackup, importBackup } from '../features/backups/backupsApi.js';

const COLLECTION_LABELS = {
  customers: 'Clienti',
  addresses: 'Indirizzi',
  phones: 'Telefoni',
  emailAddresses: 'Indirizzi email',
  banks: 'Banche',
  bankAccounts: 'Conti correnti',
  loans: 'Mutui',
  loanInstallments: 'Rate mutuo',
};

// Estrae il messaggio d'errore da una risposta axios che può arrivare come
// Blob (per via di responseType: "blob" sulla richiesta di export) invece
// che come JSON già parsato.
async function extractErrorMessage(error, fallback) {
  const data = error.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      return JSON.parse(text)?.message ?? fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message ?? fallback;
}

export default function ImportExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const blob = await exportBackup();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bmcons-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(await extractErrorMessage(error, 'Impossibile generare il backup.'));
    } finally {
      setIsExporting(false);
    }
  };

  const runImport = async () => {
    setConfirmOpen(false);
    setIsImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const result = await importBackup(file);
      setImportResult(result);
      setFile(null);
    } catch (error) {
      setImportError(await extractErrorMessage(error, 'Impossibile importare il backup.'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h1 className="mb-2 text-lg font-semibold text-text-dark">Esporta dati</h1>
        <p className="mb-4 text-sm text-text">
          Scarica un backup di tutti i dati dell'applicazione (clienti, indirizzi, telefoni,
          email, banche, conti correnti, mutui e rate) in un unico file JSON, riutilizzabile per
          l'importazione. Gli utenti non sono inclusi.
        </p>

        {exportError && <p className="mb-4 text-sm text-red-600">{exportError}</p>}

        <Button onClick={handleExport} isLoading={isExporting}>
          Scarica backup
        </Button>
      </Card>

      <Card>
        <h1 className="mb-2 text-lg font-semibold text-text-dark">Importa dati</h1>
        <p className="mb-4 text-sm text-text">
          Seleziona un file di backup generato in precedenza con la funzione sopra.{' '}
          <strong>Attenzione:</strong> i dati esistenti nelle sezioni presenti nel file verranno
          sovrascritti definitivamente. Gli utenti non vengono toccati.
        </p>

        <input
          type="file"
          accept="application/json"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setImportResult(null);
            setImportError(null);
          }}
          className="mb-4 block text-sm text-text-dark file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-text-dark hover:file:bg-gray-200"
        />

        {importError && <p className="mb-4 text-sm text-red-600">{importError}</p>}

        {importResult && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            <p className="mb-1 font-medium">Importazione completata:</p>
            <ul className="list-inside list-disc">
              {Object.entries(importResult.imported ?? {}).map(([key, count]) => (
                <li key={key}>
                  {COLLECTION_LABELS[key] ?? key}: {count}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          variant="danger"
          disabled={!file}
          isLoading={isImporting}
          onClick={() => setConfirmOpen(true)}
        >
          Importa backup
        </Button>
      </Card>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Conferma importazione"
        message={`Vuoi importare "${file?.name}"? I dati esistenti nelle sezioni presenti nel file verranno sovrascritti e l'operazione non è reversibile.`}
        confirmLabel="Importa e sovrascrivi"
        onConfirm={runImport}
        onCancel={() => setConfirmOpen(false)}
        isLoading={isImporting}
      />
    </div>
  );
}
