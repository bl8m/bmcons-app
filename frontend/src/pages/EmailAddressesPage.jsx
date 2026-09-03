import { useEffect, useState } from 'react';
import ResourcePage from '../components/ResourcePage.jsx';
import EmailAddressForm from '../features/emailAddresses/EmailAddressForm.jsx';
import { emailAddressesApi } from '../features/emailAddresses/emailAddressesApi.js';
import { customersApi } from '../features/customers/customersApi.js';
import { useAuthStore } from '../features/auth/authStore.js';

export default function EmailAddressesPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'administrator');
  const [customers, setCustomers] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      customersApi.list().then(setCustomers);
    }
  }, [isAdmin]);

  const columns = [
    { key: 'label', label: 'Etichetta' },
    { key: 'email', label: 'Email' },
    { key: 'isPrimary', label: 'Principale', render: (item) => (item.isPrimary ? 'Sì' : 'No') },
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
      title="Indirizzi email"
      newButtonLabel="Nuova email"
      api={emailAddressesApi}
      columns={columns}
      getItemLabel={(item) => item.email}
      FormComponent={EmailAddressForm}
      formProps={{ customers: isAdmin ? (customers ?? []) : undefined }}
    />
  );
}
