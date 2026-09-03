import { useMemo } from 'react';
import ResourcePage from '../../components/ResourcePage.jsx';

// Tab generica per gestire un'entità figlia di un cliente (indirizzi,
// telefoni, email, conti correnti) incorporata nella modale di modifica
// cliente: stessa meccanica di ResourcePage, ma senza selettore cliente
// (già noto) — la lista viene filtrata e ogni nuovo record assegnato
// automaticamente al customerId corrente.
export default function CustomerRelatedResourceTab({
  customerId,
  resourceApi,
  columns,
  FormComponent,
  formProps = {},
  getItemLabel,
  newButtonLabel,
  emptyMessage,
}) {
  const scopedApi = useMemo(
    () => ({
      list: () => resourceApi.list({ customerId }),
      create: (data) => resourceApi.create({ ...data, customerId }),
      update: (id, data) => resourceApi.update(id, data),
      remove: (id) => resourceApi.remove(id),
    }),
    [resourceApi, customerId]
  );

  return (
    <ResourcePage
      embedded
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
