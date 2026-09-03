import { useEffect, useState } from 'react';
import Tabs from '../../components/Tabs.jsx';
import CustomerForm from './CustomerForm.jsx';
import CustomerRelatedResourceTab from './CustomerRelatedResourceTab.jsx';
import AddressForm from '../addresses/AddressForm.jsx';
import { addressesApi } from '../addresses/addressesApi.js';
import PhoneForm from '../phones/PhoneForm.jsx';
import { phonesApi } from '../phones/phonesApi.js';
import EmailAddressForm from '../emailAddresses/EmailAddressForm.jsx';
import { emailAddressesApi } from '../emailAddresses/emailAddressesApi.js';
import BankAccountForm from '../bankAccounts/BankAccountForm.jsx';
import { bankAccountsApi } from '../bankAccounts/bankAccountsApi.js';
import { banksApi } from '../banks/banksApi.js';

const TABS = [
  { key: 'profile', label: 'Dati anagrafici' },
  { key: 'addresses', label: 'Indirizzi' },
  { key: 'phones', label: 'Telefoni' },
  { key: 'emails', label: 'Email' },
  { key: 'bankAccounts', label: 'Conti correnti' },
];

const boolLabel = (item) => (item.isPrimary ? 'Sì' : 'No');

// Sostituisce CustomerForm come FormComponent della pagina Clienti: in
// creazione mostra solo il form anagrafico (non esiste ancora un customerId
// a cui agganciare indirizzi/telefoni/...); in modifica aggiunge la
// navigazione a tab verso le entità collegate al cliente.
export default function CustomerFormWithTabs(props) {
  const { mode, defaultValues, users, ...formOnlyProps } = props;
  const [activeTab, setActiveTab] = useState('profile');
  const [banks, setBanks] = useState([]);

  const customerId = mode === 'edit' ? defaultValues?._id : undefined;

  useEffect(() => {
    if (customerId) {
      banksApi.list().then(setBanks);
    }
  }, [customerId]);

  if (!customerId) {
    return (
      <CustomerForm mode={mode} defaultValues={defaultValues} users={users} {...formOnlyProps} />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'profile' && (
        <CustomerForm mode={mode} defaultValues={defaultValues} users={users} {...formOnlyProps} />
      )}

      {activeTab === 'addresses' && (
        <CustomerRelatedResourceTab
          customerId={customerId}
          resourceApi={addressesApi}
          FormComponent={AddressForm}
          newButtonLabel="Nuovo indirizzo"
          getItemLabel={(item) => item.label}
          columns={[
            { key: 'label', label: 'Etichetta' },
            { key: 'street', label: 'Indirizzo' },
            { key: 'city', label: 'Città' },
            { key: 'isPrimary', label: 'Principale', render: boolLabel },
          ]}
        />
      )}

      {activeTab === 'phones' && (
        <CustomerRelatedResourceTab
          customerId={customerId}
          resourceApi={phonesApi}
          FormComponent={PhoneForm}
          newButtonLabel="Nuovo telefono"
          getItemLabel={(item) => item.label}
          columns={[
            { key: 'label', label: 'Etichetta' },
            { key: 'number', label: 'Numero' },
            { key: 'isPrimary', label: 'Principale', render: boolLabel },
          ]}
        />
      )}

      {activeTab === 'emails' && (
        <CustomerRelatedResourceTab
          customerId={customerId}
          resourceApi={emailAddressesApi}
          FormComponent={EmailAddressForm}
          newButtonLabel="Nuova email"
          getItemLabel={(item) => item.email}
          columns={[
            { key: 'label', label: 'Etichetta' },
            { key: 'email', label: 'Email' },
            { key: 'isPrimary', label: 'Principale', render: boolLabel },
          ]}
        />
      )}

      {activeTab === 'bankAccounts' && (
        <CustomerRelatedResourceTab
          customerId={customerId}
          resourceApi={bankAccountsApi}
          FormComponent={BankAccountForm}
          formProps={{ banks }}
          newButtonLabel="Nuovo conto corrente"
          getItemLabel={(item) => item.label}
          columns={[
            { key: 'label', label: 'Etichetta' },
            { key: 'iban', label: 'IBAN' },
            {
              key: 'bank',
              label: 'Banca',
              render: (item) => banks.find((b) => b._id === item.bankId)?.name ?? '—',
            },
          ]}
        />
      )}
    </div>
  );
}
