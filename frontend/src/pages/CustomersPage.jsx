import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ResourcePage from '../components/ResourcePage.jsx';
import CustomerFormWithTabs from '../features/customers/CustomerFormWithTabs.jsx';
import { customersApi } from '../features/customers/customersApi.js';
import { usersApi } from '../features/users/usersApi.js';

export default function CustomersPage() {
  const [customerUsers, setCustomerUsers] = useState([]);

  useEffect(() => {
    usersApi.list().then((users) => setCustomerUsers(users.filter((u) => u.role === 'customer')));
  }, []);

  return (
    <ResourcePage
      title="Clienti"
      newButtonLabel="Nuovo cliente"
      api={customersApi}
      columns={[
        { key: 'companyName', label: 'Ragione sociale' },
        { key: 'vatNumber', label: 'Partita IVA' },
        { key: 'taxCode', label: 'Codice fiscale' },
        {
          key: 'account',
          label: 'Account collegato',
          render: (item) => customerUsers.find((u) => u._id === item.userId)?.email ?? '—',
        },
      ]}
      extraRowActions={(item) => (
        <Link
          to={`/admin/customers/${item._id}`}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-text transition-colors hover:bg-gray-50"
        >
          Visualizza
        </Link>
      )}
      getItemLabel={(item) => item.companyName}
      FormComponent={CustomerFormWithTabs}
      formProps={{ users: customerUsers }}
      modalSize="xl"
    />
  );
}
