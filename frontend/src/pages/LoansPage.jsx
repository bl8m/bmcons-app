import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ResourcePage from '../components/ResourcePage.jsx';
import LoanFormWithTabs from '../features/loans/LoanFormWithTabs.jsx';
import { loansApi } from '../features/loans/loansApi.js';
import { customersApi } from '../features/customers/customersApi.js';
import { banksApi } from '../features/banks/banksApi.js';
import { useAuthStore } from '../features/auth/authStore.js';
import { formatCurrency } from '../lib/format.js';

export default function LoansPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'administrator');
  const [searchParams] = useSearchParams();
  // Es. /admin/loans?customerId=... (link da StatTile nella scheda cliente):
  // per il customer il backend scopera comunque solo i propri mutui, quindi
  // qui il filtro ha effetto solo per l'amministratore.
  const customerIdFilter = searchParams.get('customerId') ?? undefined;
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

  const filteredCustomerName =
    isAdmin && customerIdFilter
      ? (customers?.find((c) => c._id === customerIdFilter)?.companyName ?? customerIdFilter)
      : null;

  return (
    <div className="flex flex-col gap-4">
      {filteredCustomerName && (
        <p className="text-sm text-text">
          Filtrato per cliente: <strong>{filteredCustomerName}</strong> —{' '}
          <Link to="/admin/loans" className="font-medium text-primary hover:text-primary-600">
            mostra tutti
          </Link>
        </p>
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
