import { useForm, useFieldArray } from 'react-hook-form';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';

const emptyAmount = { type: '', amount: '' };

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

// La select "Cliente" viene mostrata solo se viene passato l'elenco dei
// clienti (contesto amministratore, come per Mutui).
export default function CreditLineForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
  customers,
  banks = [],
  creditLineTypes = [],
  amountTypes = [],
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerId: '',
      bankId: '',
      creditLineTypeId: '',
      label: '',
      amounts: [],
      ...defaultValues,
    },
  });

  const amounts = useFieldArray({ control, name: 'amounts' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {customers && (
        <Select
          id="customerId"
          label="Cliente"
          options={customers.map((c) => ({ value: c._id, label: c.companyName }))}
          error={errors.customerId?.message}
          {...register('customerId', { required: 'Cliente obbligatorio' })}
        />
      )}

      <Select
        id="bankId"
        label="Banca"
        options={banks.map((b) => ({ value: b._id, label: b.name }))}
        error={errors.bankId?.message}
        {...register('bankId', { required: 'Banca obbligatoria' })}
      />

      <Select
        id="creditLineTypeId"
        label="Tipo di affidamento"
        options={creditLineTypes.map((t) => ({ value: t._id, label: t.name }))}
        error={errors.creditLineTypeId?.message}
        {...register('creditLineTypeId', { required: 'Tipo di affidamento obbligatorio' })}
      />

      <Input
        id="label"
        label="Etichetta"
        error={errors.label?.message}
        {...register('label', { required: 'Etichetta obbligatoria' })}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-dark">Importi</h3>
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1 text-xs"
            onClick={() => amounts.append(emptyAmount)}
          >
            Aggiungi importo
          </Button>
        </div>
        {amounts.fields.length === 0 && (
          <p className="text-sm text-text">Nessun importo inserito.</p>
        )}
        {amounts.fields.map((field, index) => (
          <RepeaterRow key={field.id} onRemove={() => amounts.remove(index)}>
            <Select
              label="Tipo"
              options={amountTypes.map((type) => ({ value: type, label: type }))}
              error={errors.amounts?.[index]?.type?.message}
              {...register(`amounts.${index}.type`, { required: 'Tipo obbligatorio' })}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              label="Importo"
              error={errors.amounts?.[index]?.amount?.message}
              {...register(`amounts.${index}.amount`, {
                required: 'Importo obbligatorio',
                valueAsNumber: true,
              })}
            />
          </RepeaterRow>
        ))}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'edit' ? 'Salva modifiche' : 'Crea affidamento'}
        </Button>
      </div>
    </form>
  );
}
