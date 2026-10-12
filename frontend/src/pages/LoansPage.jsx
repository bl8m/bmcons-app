import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResourcePage from '../components/ResourcePage.jsx';
import CustomerAutocomplete from '../components/CustomerAutocomplete.jsx';
import LoanFormWithTabs from '../features/loans/LoanFormWithTabs.jsx';
import { loansApi } from '../features/loans/loansApi.js';
import { customersApi } from '../features/customers/customersApi.js';
import { banksApi } from '../features/banks/banksApi.js';
import { useAuthStore } from '../features/auth/authStore.js';
import { formatCurrency } from '../lib/format.js';

export default function LoansPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'administrator');
  const [searchParams, setSearchParams] = useSearchParams();
  // Es. /admin/loans?customerId=... (link da StatTile nella scheda cliente,
  // oppure selezione dalla tendina con completamento automatico qui sotto):
  // per il customer il backend scopera comunque solo i propri mutui, quindi
  // qui il filtro ha effetto solo per l'amministratore.
  const customerIdFilter = searchParams.get('customerId') ?? undefined;

  const handleCustomerFilterChange = (customerId) => {
    const next = new URLSearchParams(searchParams);
    if (customerId) {
      next.set('customerId', customerId);
    } else {
      next.delete('customerId');
    }
    setSearchParams(next);
  };
  // Es. /admin/loans?edit=... (link "N." nello scadenzario mutui): apre
  // direttamente la modale di modifica per quel mutuo, vedi ResourcePage.
  const editId = searchParams.get('edit') ?? undefined;
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

  const listParams = useMemo(
    () => (customerIdFilter ? { customerId: customerIdFilter } : undefined),
    [customerIdFilter]
  );

  const columns = [
    { key: 'label', label: 'Etichetta' },
    { key: 'amount', label: 'Importo', render: (item) => formatCurrency(item.amount) },
    { key: 'durationYears', label: 'Durata (anni)', render: (item) => item.durationYears ?? '—' },
    { key: 'type', label: 'Tipo', render: (item) => item.type ?? '—' },
    { key: 'bank', label: 'Banca', render: (item) => banks.find((b) => b._id === item.bankId)?.name ?? '—' },
  ];

  // Colonna "Cliente" ridondante quando l'elenco è già filtrato su un solo cliente.
  if (isAdmin && !customerIdFilter) {
    columns.push({
      key: 'customer',
      label: 'Cliente',
      render: (item) => customers?.find((c) => c._id === item.customerId)?.companyName ?? '—',
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-dark">Filtra per cliente:</span>
          <CustomerAutocomplete
            customers={customers ?? []}
            value={customerIdFilter}
            onChange={handleCustomerFilterChange}
          />
        </div>
      )}

      <ResourcePage
        title="Mutui"
        newButtonLabel="Nuovo mutuo"
        api={loansApi}
        listParams={listParams}
        columns={columns}
        getItemLabel={(item) => item.label}
        FormComponent={LoanFormWithTabs}
        formProps={{ customers: isAdmin ? (customers ?? []) : undefined, banks }}
        modalSize="xl"
        readOnly={!isAdmin}
        initialEditId={editId}
      />
    </div>
  );
}
