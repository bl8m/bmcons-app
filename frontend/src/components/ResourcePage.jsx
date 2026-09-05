import { useCallback, useEffect, useState } from 'react';
import Card from './Card.jsx';
import Spinner from './Spinner.jsx';
import Button from './Button.jsx';
import Modal from './Modal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

// Pagina generica di elenco + CRUD per una risorsa REST: elimina la
// duplicazione tra le varie sezioni ANAGRAFICHE (clienti, indirizzi,
// telefoni, email, banche, conti correnti, utenti, ...), che condividono
// tutte la stessa meccanica di lista/creazione/modifica/cancellazione.
//
// Props:
// - title: titolo della sezione
// - api: { list, create, update, remove } (vedi lib/makeCrudApi.js)
// - columns: [{ key, label, render?(item) }]
// - FormComponent: (mode, defaultValues, onSubmit, onCancel, isSubmitting, serverError, ...formProps)
// - formProps: props aggiuntive passate al form (es. liste per le select)
// - getItemLabel(item): testo usato nel messaggio di conferma cancellazione
// - canDelete(item): se false disabilita l'azione "Elimina" per quel record
// - embedded: se true, non incapsula il contenuto in una Card (usato quando
//   la lista è già incorporata in un altro contenitore, es. una tab)
// - modalSize: dimensione della modale di creazione/modifica (vedi Modal.jsx)
// - readOnly: se true, nasconde "Nuovo"/"Modifica"/"Elimina" e mostra solo
//   l'elenco (usato per l'accesso in sola lettura del customer a dati che
//   gestisce solo l'amministratore, es. Mutui e Rate)
export default function ResourcePage({
  title,
  api,
  columns,
  FormComponent,
  formProps = {},
  getItemLabel = (item) => item._id,
  canDelete = () => true,
  deleteDisabledTitle,
  newButtonLabel = 'Nuovo',
  emptyMessage = 'Nessun elemento presente.',
  embedded = false,
  modalSize = 'md',
  readOnly = false,
}) {
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // null | { mode: 'create' } | { mode: 'edit', item }
  const [formState, setFormState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setItems(await api.list());
    } catch {
      setLoadError('Impossibile caricare i dati.');
    }
  }, [api]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (formState.mode === 'create') {
        await api.create(payload);
      } else {
        await api.update(formState.item._id, payload);
      }
      setFormState(null);
      await fetchItems();
    } catch (error) {
      setFormError(error.response?.data?.message ?? 'Operazione non riuscita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.remove(itemToDelete._id);
      setItemToDelete(null);
      await fetchItems();
    } catch (error) {
      setLoadError(error.response?.data?.message ?? "Impossibile eliminare l'elemento.");
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const content = (
    <>
      <div className="mb-4 flex items-center justify-between">
        {title && <h1 className="text-lg font-semibold text-text-dark">{title}</h1>}
        {!readOnly && (
          <Button
            className={title ? '' : 'ml-auto'}
            onClick={() => {
              setFormError(null);
              setFormState({ mode: 'create' });
            }}
          >
            {newButtonLabel}
          </Button>
        )}
      </div>

      {loadError && <p className="mb-2 text-sm text-red-600">{loadError}</p>}
      {!items && !loadError && <Spinner />}
      {items && items.length === 0 && <p className="text-sm text-text">{emptyMessage}</p>}

      {items && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-text-light">
                {columns.map((col) => (
                  <th key={col.key} className="py-2 pr-4">
                    {col.label}
                  </th>
                ))}
                {!readOnly && <th className="py-2 text-right">Azioni</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-gray-100">
                  {columns.map((col) => (
                    <td key={col.key} className="py-2 pr-4">
                      {col.render ? col.render(item) : (item[col.key] ?? '—')}
                    </td>
                  ))}
                  {!readOnly && (
                    <td className="py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          className="px-3 py-1 text-xs"
                          onClick={() => {
                            setFormError(null);
                            setFormState({ mode: 'edit', item });
                          }}
                        >
                          Modifica
                        </Button>
                        <Button
                          variant="danger"
                          className="px-3 py-1 text-xs"
                          disabled={!canDelete(item)}
                          title={!canDelete(item) ? deleteDisabledTitle?.(item) : undefined}
                          onClick={() => setItemToDelete(item)}
                        >
                          Elimina
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <>
      {embedded ? content : <Card>{content}</Card>}

      {!readOnly && (
        <>
          <Modal
            isOpen={formState !== null}
            onClose={() => setFormState(null)}
            title={formState?.mode === 'edit' ? 'Modifica' : newButtonLabel}
            size={modalSize}
          >
            {formState && (
              <FormComponent
                mode={formState.mode}
                defaultValues={formState.mode === 'edit' ? formState.item : undefined}
                onSubmit={handleSubmit}
                onCancel={() => setFormState(null)}
                isSubmitting={isSubmitting}
                serverError={formError}
                {...formProps}
              />
            )}
          </Modal>

          <ConfirmDialog
            isOpen={itemToDelete !== null}
            title="Conferma eliminazione"
            message={`Vuoi eliminare definitivamente "${itemToDelete ? getItemLabel(itemToDelete) : ''}"? L'operazione non è reversibile.`}
            confirmLabel="Elimina"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setItemToDelete(null)}
            isLoading={isDeleting}
          />
        </>
      )}
    </>
  );
}
