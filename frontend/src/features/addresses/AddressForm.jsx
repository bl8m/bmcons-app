import { useForm } from 'react-hook-form';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import Button from '../../components/Button.jsx';

// La select "Cliente" viene mostrata solo se viene passato l'elenco dei
// clienti (contesto amministratore): per il customer sui propri dati il
// backend assegna automaticamente il customerId, il campo va quindi omesso.
export default function AddressForm({
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
      street: '',
      city: '',
      postalCode: '',
      province: '',
      country: '',
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
        id="street"
        label="Indirizzo"
        error={errors.street?.message}
        {...register('street', { required: 'Indirizzo obbligatorio' })}
      />
      <Input
        id="city"
        label="Città"
        error={errors.city?.message}
        {...register('city', { required: 'Città obbligatoria' })}
      />
      <Input id="postalCode" label="CAP" {...register('postalCode')} />
      <Input id="province" label="Provincia" {...register('province')} />
      <Input id="country" label="Stato" {...register('country')} />
      <Checkbox id="isPrimary" label="Indirizzo principale" {...register('isPrimary')} />

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'edit' ? 'Salva modifiche' : 'Crea indirizzo'}
        </Button>
      </div>
    </form>
  );
}
