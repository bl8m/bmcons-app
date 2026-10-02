import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { customersApi } from './customersApi.js';

const emptyShareholder = { lastName: '', firstName: '', taxCode: '', share: '' };
const emptyAdministrator = { lastName: '', firstName: '', taxCode: '', role: '' };

function RepeaterRow({ children, onRemove }) {
  return (
    <div className="rounded-md border border-gray-200 p-3">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Rimuovi
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

// Tab "Dettagli" del cliente: dati tipicamente presenti in una visura
// camerale. Gestisce da sé la propria lettura/scrittura (PATCH parziale sul
// cliente), indipendente dal form principale "Dati anagrafici".
export default function CustomerDetailsForm({ customerId, defaultValues }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      subscribedShareCapital: '',
      businessStartDate: '',
      administrationSystem: '',
      businessActivity: '',
      shareholders: [],
      administrators: [],
      ...defaultValues,
      businessStartDate: defaultValues?.businessStartDate
        ? defaultValues.businessStartDate.slice(0, 10)
        : '',
    },
  });

  const shareholders = useFieldArray({ control, name: 'shareholders' });
  const administrators = useFieldArray({ control, name: 'administrators' });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      const updated = await customersApi.update(customerId, data);
      reset({
        ...updated,
        businessStartDate: updated.businessStartDate ? updated.businessStartDate.slice(0, 10) : '',
      });
      setSuccessMessage('Dati aggiornati con successo.');
    } catch (error) {
      setServerError(error.response?.data?.message ?? 'Operazione non riuscita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        id="subscribedShareCapital"
        type="number"
        step="0.01"
        min="0"
        label="Capitale sociale sottoscritto (€)"
        {...register('subscribedShareCapital', { valueAsNumber: true })}
      />
      <Input
        id="businessStartDate"
        type="date"
        label="Data inizio attività"
        {...register('businessStartDate')}
      />
      <Input
        id="administrationSystem"
        label="Sistema di amministrazione"
        {...register('administrationSystem')}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="businessActivity" className="text-sm font-medium text-text-dark">
          Attività svolta
        </label>
        <textarea
          id="businessActivity"
          rows={4}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-text-dark placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-200"
          {...register('businessActivity')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-dark">Soci</h3>
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1 text-xs"
            onClick={() => shareholders.append(emptyShareholder)}
          >
            Aggiungi socio
          </Button>
        </div>
        {shareholders.fields.length === 0 && (
          <p className="text-sm text-text">Nessun socio inserito.</p>
        )}
        {shareholders.fields.map((field, index) => (
          <RepeaterRow key={field.id} onRemove={() => shareholders.remove(index)}>
            <Input label="Cognome" {...register(`shareholders.${index}.lastName`)} />
            <Input label="Nome" {...register(`shareholders.${index}.firstName`)} />
            <Input label="Codice fiscale" {...register(`shareholders.${index}.taxCode`)} />
            <Input label="Quota" {...register(`shareholders.${index}.share`)} />
          </RepeaterRow>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-dark">Amministratori</h3>
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1 text-xs"
            onClick={() => administrators.append(emptyAdministrator)}
          >
            Aggiungi amministratore
          </Button>
        </div>
        {administrators.fields.length === 0 && (
          <p className="text-sm text-text">Nessun amministratore inserito.</p>
        )}
        {administrators.fields.map((field, index) => (
          <RepeaterRow key={field.id} onRemove={() => administrators.remove(index)}>
            <Input label="Cognome" {...register(`administrators.${index}.lastName`)} />
            <Input label="Nome" {...register(`administrators.${index}.firstName`)} />
            <Input label="Codice fiscale" {...register(`administrators.${index}.taxCode`)} />
            <Input label="Carica" {...register(`administrators.${index}.role`)} />
          </RepeaterRow>
        ))}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}

      <div className="mt-2 flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Salva modifiche
        </Button>
      </div>
    </form>
  );
}
