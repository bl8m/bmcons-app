import { useMemo } from 'react';
import ResourcePage from './ResourcePage.jsx';

// Tab generica per gestire un'entità figlia (indirizzi, rate mutuo, ...)
// incorporata nella modale di modifica del genitore (cliente, mutuo, ...):
// stessa meccanica di ResourcePage, ma senza selettore del genitore (già
// noto) — la lista viene filtrata e ogni nuovo record assegnato
// automaticamente al valore di scope corrente.
export default function ScopedResourceTab({
  scopeField, // es. 'customerId' o 'loanId'
  scopeValue,
  resourceApi,
  columns,
  FormComponent,
  formProps = {},
  getItemLabel,
  newButtonLabel,
  emptyMessage,
  readOnly = false,
}) {
  const scopedApi = useMemo(
    () => ({
      list: () => resourceApi.list({ [scopeField]: scopeValue }),
      create: (data) => resourceApi.create({ ...data, [scopeField]: scopeValue }),
      update: (id, data) => resourceApi.update(id, data),
      remove: (id) => resourceApi.remove(id),
    }),
    [resourceApi, scopeField, scopeValue]
  );

  return (
    <ResourcePage
      embedded
      readOnly={readOnly}
      api={scopedApi}
      columns={columns}
      FormComponent={FormComponent}
      formProps={formProps}
      getItemLabel={getItemLabel}
      newButtonLabel={newButtonLabel}
      emptyMessage={emptyMessage}
    />
  );
}
