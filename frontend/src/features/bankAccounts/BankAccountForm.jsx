import { useForm } from 'react-hook-form';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';

export default function BankAccountForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
  banks = [],
  customers, // se presente, mostra il selettore cliente (contesto amministratore)
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
      iban: '',
      branch: '',
      notes: '',
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
        id="iban"
        label="IBAN"
        error={errors.iban?.message}
        {...register('iban', { required: 'IBAN obbligatorio' })}
      />
      <Input id="branch" label="Agenzia" {...register('branch')} />
      <Input id="notes" label="Note" {...register('notes')} />

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'edit' ? 'Salva modifiche' : 'Crea conto corrente'}
        </Button>
      </div>
    </form>
  );
}
