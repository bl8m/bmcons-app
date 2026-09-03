import Card from '../components/Card.jsx';

export default function AdminDashboard() {
  return (
    <Card>
      <h1 className="text-lg font-semibold text-text-dark">Dashboard amministratore</h1>
      <p className="mt-2 text-sm text-text">
        Qui troverai la panoramica dei dati di tutti i clienti, una volta definite le entità.
      </p>
    </Card>
  );
}
