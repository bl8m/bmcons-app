import { useEffect, useState } from 'react';
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
      getItemLabel={(item) => item.companyName}
      FormComponent={CustomerFormWithTabs}
      formProps={{ users: customerUsers }}
      modalSize="xl"
    />
  );
}
