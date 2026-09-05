import { useState } from 'react';
import Tabs from '../../components/Tabs.jsx';
import ScopedResourceTab from '../../components/ScopedResourceTab.jsx';
import LoanForm from './LoanForm.jsx';
import LoanInstallmentForm from '../loanInstallments/LoanInstallmentForm.jsx';
import { loanInstallmentsApi } from '../loanInstallments/loanInstallmentsApi.js';
import LoanDocumentImport from './LoanDocumentImport.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';

const TABS = [
  { key: 'info', label: 'Dati mutuo' },
  { key: 'installments', label: 'Rate' },
  { key: 'documents', label: 'Documenti' },
];

// Sostituisce LoanForm come FormComponent della pagina Mutui: in creazione
// mostra solo il form anagrafico (non esiste ancora un loanId a cui
// agganciare le rate); in modifica aggiunge le tab Rate e Documenti.
export default function LoanFormWithTabs(props) {
  const { mode, defaultValues, customers, banks, ...formOnlyProps } = props;
  const [activeTab, setActiveTab] = useState('info');

  const loanId = mode === 'edit' ? defaultValues?._id : undefined;

  if (!loanId) {
    return (
      <LoanForm
        mode={mode}
        defaultValues={defaultValues}
        customers={customers}
        banks={banks}
        {...formOnlyProps}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'info' && (
        <LoanForm
          mode={mode}
          defaultValues={defaultValues}
          customers={customers}
          banks={banks}
          {...formOnlyProps}
        />
      )}

      {activeTab === 'installments' && (
        <ScopedResourceTab
          scopeField="loanId"
          scopeValue={loanId}
          resourceApi={loanInstallmentsApi}
          FormComponent={LoanInstallmentForm}
          newButtonLabel="Nuova rata"
          getItemLabel={(item) => `Rata n. ${item.number}`}
          columns={[
            { key: 'number', label: 'Numero' },
            { key: 'dueDate', label: 'Scadenza', render: (item) => formatDate(item.dueDate) },
            { key: 'amount', label: 'Importo', render: (item) => formatCurrency(item.amount) },
            { key: 'isPaid', label: 'Pagata', render: (item) => (item.isPaid ? 'Sì' : 'No') },
          ]}
        />
      )}

      {activeTab === 'documents' && (
        <LoanDocumentImport loanId={loanId} onImported={() => setActiveTab('installments')} />
      )}
    </div>
  );
}
