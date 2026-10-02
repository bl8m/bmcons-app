import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card.jsx';
import Spinner from './Spinner.jsx';
import Button from './Button.jsx';
import { formatCurrency, formatDate } from '../lib/format.js';
import {
  getLoanScheduleReport,
  downloadLoanScheduleReportXlsx,
} from '../features/customers/loanReportApi.js';

async function extractErrorMessage(error, fallback) {
  const data = error.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      return JSON.parse(text)?.message ?? fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message ?? fallback;
}

// Scadenzario mutui di un cliente: una riga per mutuo (non aggregato per
// banca). Le due colonne di debito residuo sono dinamiche — calcolate
// rispetto a "oggi" dal backend (services/loanReportService.js) — quindi le
// intestazioni cambiano da sole col passare del tempo, senza bisogno di
// aggiornare nulla qui.
export default function LoanScheduleReport({ customerId }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    getLoanScheduleReport(customerId)
      .then(setReport)
      .catch(() => setError('Impossibile caricare lo scadenzario mutui.'));
  }, [customerId]);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const blob = await downloadLoanScheduleReportXlsx(customerId);
      const timestamp = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scadenzario-mutui-${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(await extractErrorMessage(err, 'Impossibile esportare il file.'));
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!report) {
    return <Spinner className="h-24" />;
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-text-dark">
        Dettaglio debiti a scadenza alla data odierna{' '}
        <span className="text-primary">{formatDate(new Date())}</span>
      </h2>

      {report.rows.length === 0 ? (
        <p className="text-sm text-text">Nessun mutuo presente per questo cliente.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-text-light">
                <th className="py-2 pr-4">N.</th>
                <th className="py-2 pr-4">Banca</th>
                <th className="py-2 pr-4">Mutuo</th>
                <th className="py-2 pr-4">Importo originario</th>
                <th className="py-2 pr-4">Durata (mesi)</th>
                <th className="py-2 pr-4">Inizio ammortamento</th>
                <th className="py-2 pr-4">Scadenza</th>
                <th className="py-2 pr-4">Debito residuo al {report.previousMonthEndLabel}</th>
                <th className="py-2 pr-4">Debito residuo al {report.currentYearEndLabel}</th>
                {report.months.map((month) => (
                  <th key={month} className="py-2 pr-4">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr
                  key={row.loanId}
                  className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                >
                  <td className="py-2 pr-4">
                    <Link
                      to={`/admin/loans?customerId=${customerId}&edit=${row.loanId}`}
                      className="font-medium text-primary hover:text-primary-600"
                    >
                      {index + 1}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{row.bank}</td>
                  <td className="py-2 pr-4">{row.label}</td>
                  <td className="py-2 pr-4">{formatCurrency(row.amount)}</td>
                  <td className="py-2 pr-4">{row.durationMonths ?? '—'}</td>
                  <td className="py-2 pr-4">{formatDate(row.amortizationStart)}</td>
                  <td className="py-2 pr-4">{formatDate(row.maturity)}</td>
                  <td className="py-2 pr-4">{formatCurrency(row.residualDebtPreviousMonthEnd)}</td>
                  <td className="py-2 pr-4">{formatCurrency(row.residualDebtCurrentYearEnd)}</td>
                  {report.months.map((month) => (
                    <td key={month} className="py-2 pr-4">
                      {row.monthlyPrincipal[month] !== undefined
                        ? formatCurrency(row.monthlyPrincipal[month])
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-semibold text-text-dark">
                <td className="py-2 pr-4" />
                <td className="py-2 pr-4">TOTALE</td>
                <td className="py-2 pr-4" colSpan={5} />
                <td className="py-2 pr-4">{formatCurrency(report.totalResidualDebtPreviousMonthEnd)}</td>
                <td className="py-2 pr-4">{formatCurrency(report.totalResidualDebtCurrentYearEnd)}</td>
                {report.months.map((month) => (
                  <td key={month} className="py-2 pr-4">
                    {formatCurrency(report.totalsByMonth[month])}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={handleExport}
          isLoading={isExporting}
          disabled={!report.rows.length}
        >
          Esporta XLSX
        </Button>
      </div>
    </Card>
  );
}
