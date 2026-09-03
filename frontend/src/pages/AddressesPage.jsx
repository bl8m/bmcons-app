import { useEffect, useState } from 'react';
import ResourcePage from '../components/ResourcePage.jsx';
import AddressForm from '../features/addresses/AddressForm.jsx';
import { addressesApi } from '../features/addresses/addressesApi.js';
import { customersApi } from '../features/customers/customersApi.js';
import { useAuthStore } from '../features/auth/authStore.js';

export default function AddressesPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'administrator');
  const [customers, setCustomers] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      customersApi.list().then(setCustomers);
    }
  }, [isAdmin]);

  const columns = [
    { key: 'label', label: 'Etichetta' },
    { key: 'street', label: 'Indirizzo' },
    { key: 'city', label: 'Città' },
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
      title="Indirizzi"
      newButtonLabel="Nuovo indirizzo"
      api={addressesApi}
      columns={columns}
      getItemLabel={(item) => item.label}
      FormComponent={AddressForm}
      formProps={{ customers: isAdmin ? (customers ?? []) : undefined }}
    />
  );
}
