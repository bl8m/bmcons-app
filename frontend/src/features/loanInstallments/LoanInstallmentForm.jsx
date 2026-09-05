import { useForm } from 'react-hook-form';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import Button from '../../components/Button.jsx';

// La select "Mutuo" viene mostrata solo se viene passato l'elenco dei mutui
// (elenco globale "Rate mutuo"); quando la rata viene creata dalla tab del
// mutuo, il loanId è già noto e assegnato automaticamente.
export default function LoanInstallmentForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
  loans,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      loanId: '',
      number: '',
      dueDate: '',
      amount: '',
      principalAmount: '',
      interestAmount: '',
      remainingDebt: '',
      fees: 0,
      isPaid: false,
      ...defaultValues,
      // Il backend restituisce una data ISO completa: l'input "date" vuole solo YYYY-MM-DD.
      dueDate: defaultValues?.dueDate ? defaultValues.dueDate.slice(0, 10) : '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {loans && (
        <Select
          id="loanId"
          label="Mutuo"
          options={loans.map((loan) => ({ value: loan._id, label: loan.label }))}
          error={errors.loanId?.message}
          {...register('loanId', { required: 'Mutuo obbligatorio' })}
        />
      )}

      <Input
        id="number"
        type="number"
        step="1"
        min="1"
        label="Numero rata"
        error={errors.number?.message}
        {...register('number', { required: 'Numero obbligatorio', valueAsNumber: true })}
      />
      <Input
        id="dueDate"
        type="date"
        label="Scadenza"
        error={errors.dueDate?.message}
        {...register('dueDate', { required: 'Scadenza obbligatoria' })}
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
        id="principalAmount"
        type="number"
        step="0.01"
        min="0"
        label="Quota capitale"
        error={errors.principalAmount?.message}
        {...register('principalAmount', {
          required: 'Quota capitale obbligatoria',
          valueAsNumber: true,
        })}
      />
      <Input
        id="interestAmount"
        type="number"
        step="0.01"
        min="0"
        label="Quota interessi"
        error={errors.interestAmount?.message}
        {...register('interestAmount', {
          required: 'Quota interessi obbligatoria',
          valueAsNumber: true,
        })}
      />
      <Input
        id="remainingDebt"
        type="number"
        step="0.01"
        min="0"
        label="Debito residuo"
        error={errors.remainingDebt?.message}
        {...register('remainingDebt', {
          required: 'Debito residuo obbligatorio',
          valueAsNumber: true,
        })}
      />
      <Input
        id="fees"
        type="number"
        step="0.01"
        min="0"
        label="Oneri"
        {...register('fees', { valueAsNumber: true })}
      />
      <Checkbox id="isPaid" label="Rata pagata" {...register('isPaid')} />

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'edit' ? 'Salva modifiche' : 'Crea rata'}
        </Button>
      </div>
    </form>
  );
}
