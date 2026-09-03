import { useEffect, useState } from 'react';
import ResourcePage from '../components/ResourcePage.jsx';
import PhoneForm from '../features/phones/PhoneForm.jsx';
import { phonesApi } from '../features/phones/phonesApi.js';
import { customersApi } from '../features/customers/customersApi.js';
import { useAuthStore } from '../features/auth/authStore.js';

export default function PhonesPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'administrator');
  const [customers, setCustomers] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      customersApi.list().then(setCustomers);
    }
  }, [isAdmin]);

  const columns = [
    { key: 'label', label: 'Etichetta' },
    { key: 'number', label: 'Numero' },
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
      title="Telefoni"
      newButtonLabel="Nuovo telefono"
      api={phonesApi}
      columns={columns}
      getItemLabel={(item) => item.label}
      FormComponent={PhoneForm}
      formProps={{ customers: isAdmin ? (customers ?? []) : undefined }}
    />
  );
}
