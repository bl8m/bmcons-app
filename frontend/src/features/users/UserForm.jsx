import { useForm } from 'react-hook-form';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Button from '../../components/Button.jsx';

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'administrator', label: 'Administrator' },
];

// Form unico per creazione e modifica utente.
// In modifica la password è facoltativa: se lasciata vuota non viene toccata.
export default function UserForm({
  mode, // 'create' | 'edit'
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
}) {
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'customer',
      password: '',
      confirmPassword: '',
      ...defaultValues,
    },
  });

  const password = watch('password');

  const submit = (data) => {
    const payload = { name: data.name, email: data.email, role: data.role };
    if (!isEdit || data.password) {
      payload.password = data.password;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Input
        id="name"
        label="Nome"
        error={errors.name?.message}
        {...register('name', { required: 'Nome obbligatorio' })}
      />

      <Input
        id="email"
        type="email"
        label="Email"
        error={errors.email?.message}
        {...register('email', { required: 'Email obbligatoria' })}
      />

      <Select
        id="role"
        label="Ruolo"
        options={ROLE_OPTIONS}
        error={errors.role?.message}
        {...register('role', { required: 'Ruolo obbligatorio' })}
      />

      <Input
        id="password"
        type="password"
        label={isEdit ? 'Nuova password (lascia vuoto per non modificarla)' : 'Password'}
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password', {
          validate: (value) => {
            if (isEdit && !value) return true;
            if (!value) return 'Password obbligatoria';
            return value.length >= 8 || 'La password deve avere almeno 8 caratteri';
          },
        })}
      />

      <Input
        id="confirmPassword"
        type="password"
        label="Conferma password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          validate: (value) => {
            if (!password) return true; // nessuna modifica alla password richiesta
            if (!value) return 'Conferma la password';
            return value === password || 'Le password non coincidono';
          },
        })}
      />

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEdit ? 'Salva modifiche' : 'Crea utente'}
        </Button>
      </div>
    </form>
  );
}
