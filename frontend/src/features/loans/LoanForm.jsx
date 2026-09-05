import { useForm } from 'react-hook-form';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';

// La select "Cliente" viene mostrata solo se viene passato l'elenco dei
// clienti (contesto amministratore, come per Indirizzi/Telefoni/...).
export default function LoanForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
  customers,
  banks = [],
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerId: '',
      bankId: '',
      label: '',
      amount: '',
      durationYears: '',
      type: '',
      ...defaultValues,
    },
  });

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

      <Input
        id="label"
        label="Etichetta"
        error={errors.label?.message}
        {...register('label', { required: 'Etichetta obbligatoria' })}
      />
      <Input
        id="amount"
        type="number"
        step="0.01"
        min="0"
        label="Importo"
        error={errors.amount?.message}
        {...register('amount', { required: 'Importo obbligatorio', valueAsNumber: true })}
      />
      <Input
        id="durationYears"
        type="number"
        step="1"
        min="0"
        label="Durata (anni)"
        {...register('durationYears', { valueAsNumber: true })}
      />
      <Input id="type" label="Tipo" {...register('type')} />

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'edit' ? 'Salva modifiche' : 'Crea mutuo'}
        </Button>
      </div>
    </form>
  );
}
