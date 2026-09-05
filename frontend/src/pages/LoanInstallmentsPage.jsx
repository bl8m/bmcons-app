import { useEffect, useState } from 'react';
import ResourcePage from '../components/ResourcePage.jsx';
import LoanInstallmentForm from '../features/loanInstallments/LoanInstallmentForm.jsx';
import { loanInstallmentsApi } from '../features/loanInstallments/loanInstallmentsApi.js';
import { loansApi } from '../features/loans/loansApi.js';
import { useAuthStore } from '../features/auth/authStore.js';
import { formatCurrency, formatDate } from '../lib/format.js';

// Elenco globale delle rate (di tutti i mutui, o dei propri per il
// customer, già scoperti dal backend). La gestione puntuale delle rate di
// un singolo mutuo resta comunque disponibile dalla tab "Rate" del mutuo.
export default function LoanInstallmentsPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'administrator');
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    loansApi.list().then(setLoans);
  }, []);

  const columns = [
    { key: 'number', label: 'Numero' },
    { key: 'dueDate', label: 'Scadenza', render: (item) => formatDate(item.dueDate) },
    { key: 'amount', label: 'Importo', render: (item) => formatCurrency(item.amount) },
    { key: 'isPaid', label: 'Pagata', render: (item) => (item.isPaid ? 'Sì' : 'No') },
    {
      key: 'loan',
      label: 'Mutuo',
      render: (item) => loans.find((loan) => loan._id === item.loanId)?.label ?? '—',
    },
  ];

  return (
    <ResourcePage
      title="Rate mutuo"
      newButtonLabel="Nuova rata"
      api={loanInstallmentsApi}
      columns={columns}
      getItemLabel={(item) => `Rata n. ${item.number}`}
      FormComponent={LoanInstallmentForm}
      formProps={{ loans }}
      readOnly={!isAdmin}
    />
  );
}
