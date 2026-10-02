import { useState } from 'react';
import ResourcePage from '../components/ResourcePage.jsx';
import Button from '../components/Button.jsx';
import UserForm from '../features/users/UserForm.jsx';
import ImportVisuraModal from '../features/users/ImportVisuraModal.jsx';
import { usersApi } from '../features/users/usersApi.js';
import { useAuthStore } from '../features/auth/authStore.js';

export default function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <ResourcePage
        title="Utenti"
        newButtonLabel="Nuovo utente"
        api={usersApi}
        columns={[
          { key: 'name', label: 'Nome' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Ruolo', render: (item) => <span className="capitalize">{item.role}</span> },
        ]}
        getItemLabel={(item) => item.name}
        canDelete={(item) => item._id !== (currentUser?.id ?? currentUser?._id)}
        deleteDisabledTitle={() => 'Non puoi eliminare il tuo account'}
        FormComponent={UserForm}
        headerActions={
          <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
            Importa visura
          </Button>
        }
      />

      <ImportVisuraModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </>
  );
}
