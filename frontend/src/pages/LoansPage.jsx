import { useEffect, useState } from 'react';
import ResourcePage from '../components/ResourcePage.jsx';
import LoanFormWithTabs from '../features/loans/LoanFormWithTabs.jsx';
import { loansApi } from '../features/loans/loansApi.js';
import { customersApi } from '../features/customers/customersApi.js';
import { banksApi } from '../features/banks/banksApi.js';
import { useAuthStore } from '../features/auth/authStore.js';
import { formatCurrency } from '../lib/format.js';

export default function LoansPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'administrator');
  const [customers, setCustomers] = useState(null);
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    banksApi.list().then(setBanks);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      customersApi.list().then(setCustomers);
    }
  }, [isAdmin]);

  const columns = [
    { key: 'label', label: 'Etichetta' },
    { key: 'amount', label: 'Importo', render: (item) => formatCurrency(item.amount) },
    { key: 'durationYears', label: 'Durata (anni)', render: (item) => item.durationYears ?? '—' },
    { key: 'type', label: 'Tipo', render: (item) => item.type ?? '—' },
    { key: 'bank', label: 'Banca', render: (item) => banks.find((b) => b._id === item.bankId)?.name ?? '—' },
  ];

  if (isAdmin) {
    columns.push({
      key: 'customer',
      label: 'Cliente',
      render: (item) => customers?.find((c) => c._id === item.customerId)?.companyName ?? '—',
    });
  }

  return (
    <ResourcePage
      title="Mutui"
      newButtonLabel="Nuovo mutuo"
      api={loansApi}
      columns={columns}
      getItemLabel={(item) => item.label}
      FormComponent={LoanFormWithTabs}
      formProps={{ customers: isAdmin ? (customers ?? []) : undefined, banks }}
      modalSize="xl"
      readOnly={!isAdmin}
    />
  );
}
