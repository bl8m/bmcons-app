import { useForm } from 'react-hook-form';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';

// Form condiviso tra la gestione amministratore (tutti i clienti, con
// possibilità di collegare un account) e l'auto-gestione del customer sul
// proprio profilo (allowUserLink=false nasconde il collegamento account).
export default function CustomerForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
  users, // utenti con role "customer" selezionabili per il collegamento
  allowUserLink = true,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: '',
      vatNumber: '',
      taxCode: '',
      legalRepresentativeFirstName: '',
      legalRepresentativeLastName: '',
      legalRepresentativeTaxCode: '',
      ...defaultValues,
      userId: defaultValues?.userId ?? '',
    },
  });

  const submit = (data) => {
    const payload = { ...data };
    if (!allowUserLink) {
      delete payload.userId;
    }
    onSubmit(payload);
  };

  const userOptions = [
    { value: '', label: '— Nessun account collegato —' },
    ...(users ?? []).map((user) => ({ value: user._id, label: `${user.name} (${user.email})` })),
  ];

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Input
        id="companyName"
        label="Ragione sociale"
        error={errors.companyName?.message}
        {...register('companyName', { required: 'Ragione sociale obbligatoria' })}
      />
      <Input id="vatNumber" label="Partita IVA" {...register('vatNumber')} />
      <Input id="taxCode" label="Codice fiscale" {...register('taxCode')} />
      <Input
        id="legalRepresentativeFirstName"
        label="Nome legale rappresentante"
        {...register('legalRepresentativeFirstName')}
      />
      <Input
        id="legalRepresentativeLastName"
        label="Cognome legale rappresentante"
        {...register('legalRepresentativeLastName')}
      />
      <Input
        id="legalRepresentativeTaxCode"
        label="Codice fiscale legale rappresentante"
        {...register('legalRepresentativeTaxCode')}
      />

      {allowUserLink && (
        <Select
          id="userId"
          label="Account di accesso collegato"
          options={userOptions}
          {...register('userId')}
        />
      )}

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annulla
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'edit' ? 'Salva modifiche' : 'Crea cliente'}
        </Button>
      </div>
    </form>
  );
}
