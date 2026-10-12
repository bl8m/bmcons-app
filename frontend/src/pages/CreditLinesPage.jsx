import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResourcePage from '../components/ResourcePage.jsx';
import CustomerAutocomplete from '../components/CustomerAutocomplete.jsx';
import CreditLineForm from '../features/creditLines/CreditLineForm.jsx';
import { creditLinesApi } from '../features/creditLines/creditLinesApi.js';
import { getCreditLineAmountTypes } from '../features/creditLines/creditLineAmountTypesApi.js';
import { customersApi } from '../features/customers/customersApi.js';
import { banksApi } from '../features/banks/banksApi.js';
import { creditLineTypesApi } from '../features/creditLineTypes/creditLineTypesApi.js';
import { useAuthStore } from '../features/auth/authStore.js';
import { formatCurrency } from '../lib/format.js';

export default function CreditLinesPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'administrator');
  const [searchParams, setSearchParams] = useSearchParams();
  // Es. /admin/credit-lines?customerId=... (link da StatTile nella scheda
  // cliente, oppure selezione dalla tendina con completamento automatico qui
  // sotto): per il customer il backend scopera comunque solo i propri
  // affidamenti, quindi qui il filtro ha effetto solo per l'amministratore.
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
  const [customers, setCustomers] = useState(null);
  const [banks, setBanks] = useState([]);
  const [creditLineTypes, setCreditLineTypes] = useState([]);
  const [amountTypes, setAmountTypes] = useState([]);

  useEffect(() => {
    banksApi.list().then(setBanks);
    creditLineTypesApi.list().then(setCreditLineTypes);
    getCreditLineAmountTypes().then(setAmountTypes);
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
    {
      key: 'creditLineType',
      label: 'Tipo di affidamento',
      render: (item) => creditLineTypes.find((t) => t._id === item.creditLineTypeId)?.name ?? '—',
    },
    { key: 'bank', label: 'Banca', render: (item) => banks.find((b) => b._id === item.bankId)?.name ?? '—' },
    {
      key: 'totalAmount',
      label: 'Totale importi',
      render: (item) => formatCurrency(item.amounts.reduce((sum, a) => sum + a.amount, 0)),
    },
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
        title="Affidamenti"
        newButtonLabel="Nuovo affidamento"
        api={creditLinesApi}
        listParams={listParams}
        columns={columns}
        getItemLabel={(item) => item.label}
        FormComponent={CreditLineForm}
        formProps={{
          customers: isAdmin ? (customers ?? []) : undefined,
          banks,
          creditLineTypes,
          amountTypes,
        }}
        modalSize="lg"
        readOnly={!isAdmin}
      />
    </div>
  );
}
