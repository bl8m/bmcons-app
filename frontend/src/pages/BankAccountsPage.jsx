import { useEffect, useState } from 'react';
import ResourcePage from '../components/ResourcePage.jsx';
import BankAccountForm from '../features/bankAccounts/BankAccountForm.jsx';
import { bankAccountsApi } from '../features/bankAccounts/bankAccountsApi.js';
import { banksApi } from '../features/banks/banksApi.js';
import { customersApi } from '../features/customers/customersApi.js';
import { useAuthStore } from '../features/auth/authStore.js';

export default function BankAccountsPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'administrator');
  const [banks, setBanks] = useState([]);
  const [customers, setCustomers] = useState(null);

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
    { key: 'iban', label: 'IBAN' },
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
      title="Conti correnti"
      newButtonLabel="Nuovo conto corrente"
      api={bankAccountsApi}
      columns={columns}
      getItemLabel={(item) => item.label}
      FormComponent={BankAccountForm}
      formProps={{ banks, customers: isAdmin ? (customers ?? []) : undefined }}
    />
  );
}
