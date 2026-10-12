import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';
import StatTile from '../components/StatTile.jsx';
import LoanScheduleReport from '../components/LoanScheduleReport.jsx';
import { customersApi } from '../features/customers/customersApi.js';
import { loansApi } from '../features/loans/loansApi.js';
import { creditLinesApi } from '../features/creditLines/creditLinesApi.js';

// Per ora mostra solo i dati essenziali del cliente e un primo esempio di
// StatTile (numero di mutui/affidamenti). "Mutui attivi" equivale per ora a
// "tutti i mutui": il modello Loan non ha ancora un concetto di stato
// aperto/chiuso (lo stesso vale per CreditLine).
export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(undefined);
  const [loanCount, setLoanCount] = useState(null);
  const [creditLineCount, setCreditLineCount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      customersApi.get(id),
      loansApi.list({ customerId: id }),
      creditLinesApi.list({ customerId: id }),
    ])
      .then(([customerItem, loans, creditLines]) => {
        if (cancelled) return;
        setCustomer(customerItem);
        setLoanCount(loans.length);
        setCreditLineCount(creditLines.length);
      })
      .catch(() => {
        if (!cancelled) setError('Impossibile caricare i dati del cliente.');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (customer === undefined) {
    return <Spinner className="h-40" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h1 className="text-lg font-semibold text-text-dark">{customer.companyName}</h1>
        {customer.vatNumber && <p className="text-sm text-text">P.IVA {customer.vatNumber}</p>}
      </Card>

      <div className="grid max-w-xs grid-cols-2 gap-4">
        <StatTile value={loanCount ?? '—'} label="Mutui" linkUrl={`/admin/loans?customerId=${id}`} />
        <StatTile
          value={creditLineCount ?? '—'}
          label="Affidamenti"
          linkUrl={`/admin/credit-lines?customerId=${id}`}
        />
      </div>

      <LoanScheduleReport customerId={id} />
    </div>
  );
}
