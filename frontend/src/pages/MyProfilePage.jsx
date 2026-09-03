import { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';
import CustomerForm from '../features/customers/CustomerForm.jsx';
import { getOwnCustomer, updateOwnCustomer } from '../features/customers/customersApi.js';

// Auto-gestione: il customer vede/modifica solo il proprio profilo cliente.
// La creazione resta a carico dell'amministratore (vedi sezione Clienti).
export default function MyProfilePage() {
  const [customer, setCustomer] = useState(undefined); // undefined = caricamento, null = nessun profilo
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    getOwnCustomer().then(setCustomer);
  }, []);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      setCustomer(await updateOwnCustomer(payload));
      setSuccessMessage('Dati aggiornati con successo.');
    } catch (error) {
      setServerError(error.response?.data?.message ?? 'Operazione non riuscita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (customer === undefined) {
    return <Spinner className="h-40" />;
  }

  return (
    <Card className="max-w-xl">
      <h1 className="mb-4 text-lg font-semibold text-text-dark">Il mio profilo</h1>

      {customer === null ? (
        <p className="text-sm text-text">
          Il tuo profilo anagrafico non è ancora stato configurato. Contatta l'amministratore.
        </p>
      ) : (
        <>
          {successMessage && <p className="mb-4 text-sm text-green-700">{successMessage}</p>}
          <CustomerForm
            mode="edit"
            defaultValues={customer}
            allowUserLink={false}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            serverError={serverError}
          />
        </>
      )}
    </Card>
  );
}
