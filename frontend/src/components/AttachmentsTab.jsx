import { useCallback, useEffect, useState } from 'react';
import Button from './Button.jsx';
import Input from './Input.jsx';
import Spinner from './Spinner.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import {
  listAttachments,
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
} from '../features/attachments/attachmentsApi.js';

const FileIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
  </svg>
);

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

// Tab "Allegati" generica e riutilizzabile per qualunque entità (relazione
// polimorfica lato backend, come le morph relations di Laravel): basta
// passare attachableType/attachableId. Il caricamento mostra il form nella
// stessa area, senza aprire un'altra modale.
export default function AttachmentsTab({ attachableType, attachableId }) {
  const [attachments, setAttachments] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [mode, setMode] = useState('list'); // 'list' | 'upload'
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAttachments = useCallback(async () => {
    try {
      setAttachments(await listAttachments(attachableType, attachableId));
    } catch {
      setLoadError('Impossibile caricare gli allegati.');
    }
  }, [attachableType, attachableId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const resetUploadForm = () => {
    setFile(null);
    setName('');
    setVersion('');
    setUploadError(null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      await uploadAttachment(attachableType, attachableId, file, { name, version });
      resetUploadForm();
      setMode('list');
      await fetchAttachments();
    } catch (error) {
      setUploadError(await extractErrorMessage(error, 'Impossibile caricare il file.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const blob = await downloadAttachment(attachment._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.originalFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setLoadError(await extractErrorMessage(error, 'Impossibile scaricare il file.'));
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteAttachment(attachmentToDelete._id);
      setAttachmentToDelete(null);
      await fetchAttachments();
    } catch (error) {
      setLoadError(await extractErrorMessage(error, "Impossibile eliminare l'allegato."));
      setAttachmentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {mode === 'list' && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setMode('upload')}>Carica file</Button>
        </div>
      )}

      {mode === 'upload' ? (
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm text-text-dark file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-text-dark hover:file:bg-gray-200"
          />
          <Input
            id="attachment-name"
            label="Etichetta"
            placeholder={file?.name || 'Default: nome del file'}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            id="attachment-version"
            label="Versione"
            value={version}
            onChange={(event) => setVersion(event.target.value)}
          />

          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                resetUploadForm();
                setMode('list');
              }}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={!file} isLoading={isUploading}>
              Carica
            </Button>
          </div>
        </form>
      ) : (
        <>
          {loadError && <p className="mb-2 text-sm text-red-600">{loadError}</p>}
          {!attachments && !loadError && <Spinner />}
          {attachments && attachments.length === 0 && (
            <p className="text-sm text-text">Nessun allegato presente.</p>
          )}

          {attachments && attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {attachments.map((attachment) => (
                <div
                  key={attachment._id}
                  className="relative rounded-lg border border-gray-200 p-3 text-center"
                >
                  <button
                    type="button"
                    onClick={() => setAttachmentToDelete(attachment)}
                    aria-label="Elimina allegato"
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-text-light transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(attachment)}
                    className="flex w-full flex-col items-center gap-2 text-text-dark hover:text-primary"
                    title="Scarica"
                  >
                    <FileIcon className="h-10 w-10" />
                    <span className="line-clamp-2 break-words text-xs">{attachment.name}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={attachmentToDelete !== null}
        title="Elimina allegato"
        message={`Vuoi eliminare definitivamente "${attachmentToDelete?.name}"? L'operazione non è reversibile.`}
        confirmLabel="Elimina"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setAttachmentToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
