import { useState } from 'react';
import Button from '../../components/Button.jsx';
import { importLoanInstallmentsFromPdf } from './loansApi.js';

// Tab "Documenti" della modale mutuo: carica il piano di ammortamento in PDF
// e lo fa elaborare da Claude per estrarne ed importarne le rate.
export default function LoanDocumentImport({ loanId, onImported }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);
    try {
      const data = await importLoanInstallmentsFromPdf(loanId, file);
      setResult(data);
      setFile(null);
      onImported?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Impossibile elaborare il documento.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-sm text-text">
        Carica il PDF con il piano di ammortamento del mutuo: le rate verranno estratte ed
        importate automaticamente. L'elaborazione può richiedere qualche decina di secondi per
        documenti lunghi.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-sm text-text-dark file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-text-dark hover:file:bg-gray-200"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && (
          <p className="text-sm text-green-700">
            {result.created} rat{result.created === 1 ? 'a importata' : 'e importate'}
            {result.skipped > 0
              ? `, ${result.skipped} saltat${result.skipped === 1 ? 'a' : 'e'} (numero rata già esistente o dato non valido)`
              : ''}
            .
          </p>
        )}

        <Button type="submit" disabled={!file} isLoading={isUploading} className="self-start">
          Importa rate dal PDF
        </Button>
      </form>
    </div>
  );
}
