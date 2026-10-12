import ResourcePage from '../components/ResourcePage.jsx';
import CreditLineTypeForm from '../features/creditLineTypes/CreditLineTypeForm.jsx';
import { creditLineTypesApi } from '../features/creditLineTypes/creditLineTypesApi.js';

// Sola gestione amministratore: i tipi di affidamento sono un elenco di
// riferimento condiviso, come le banche.
export default function CreditLineTypesPage() {
  return (
    <ResourcePage
      title="Tipi di affidamento"
      newButtonLabel="Nuovo tipo di affidamento"
      api={creditLineTypesApi}
      columns={[{ key: 'name', label: 'Nome' }]}
      getItemLabel={(item) => item.name}
      FormComponent={CreditLineTypeForm}
    />
  );
}
