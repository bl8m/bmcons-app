import ResourcePage from '../components/ResourcePage.jsx';
import BankForm from '../features/banks/BankForm.jsx';
import { banksApi } from '../features/banks/banksApi.js';

// Sola gestione amministratore: le banche sono un elenco di riferimento
// condiviso (il customer le vede in sola lettura nel form dei propri conti
// correnti, ma non ha accesso a questa pagina).
export default function BanksPage() {
  return (
    <ResourcePage
      title="Banche"
      newButtonLabel="Nuova banca"
      api={banksApi}
      columns={[{ key: 'name', label: 'Nome' }]}
      getItemLabel={(item) => item.name}
      FormComponent={BankForm}
    />
  );
}
