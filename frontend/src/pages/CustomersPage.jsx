import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ResourcePage from '../components/ResourcePage.jsx';
import Button from '../components/Button.jsx';
import CustomerFormWithTabs from '../features/customers/CustomerFormWithTabs.jsx';
import ImportVisuraModal from '../features/customers/ImportVisuraModal.jsx';
import { customersApi } from '../features/customers/customersApi.js';
import { usersApi } from '../features/users/usersApi.js';

export default function CustomersPage() {
  const [customerUsers, setCustomerUsers] = useState([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  // Incrementato dopo un'importazione riuscita per forzare il remount (e
  // quindi il ricaricamento) di ResourcePage, che non espone un refetch.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    usersApi.list().then((users) => setCustomerUsers(users.filter((u) => u.role === 'customer')));
  }, []);

  return (
    <>
      <ResourcePage
        key={refreshKey}
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
        headerActions={
          <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
            Importa visura
          </Button>
        }
      />

      <ImportVisuraModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={() => setRefreshKey((key) => key + 1)}
      />
    </>
  );
}
