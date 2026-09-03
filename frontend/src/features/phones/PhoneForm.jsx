import { useForm } from 'react-hook-form';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import Button from '../../components/Button.jsx';

export default function PhoneForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
  customers,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerId: '',
      label: '',
      number: '',
      isPrimary: false,
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

      <Input
        id="label"
        label="Etichetta"
        error={errors.label?.message}
        {...register('label', { required: 'Etichetta obbligatoria' })}
      />
      <Input
        id="number"
        label="Numero"
        error={errors.number?.message}
        {...register('number', { required: 'Numero obbligatorio' })}
      />
      <Checkbox id="isPrimary" label="Telefono principale" {...register('isPrimary')} />

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'edit' ? 'Salva modifiche' : 'Crea telefono'}
        </Button>
      </div>
    </form>
  );
}
