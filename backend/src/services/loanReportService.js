import { Loan } from '../models/Loan.js';
import { LoanInstallment } from '../models/LoanInstallment.js';
import { Bank } from '../models/Bank.js';
import { round2 } from '../utils/round2.js';

// Ultimo giorno del mese precedente al momento della chiamata.
function previousMonthEnd(now) {
  // Giorno 0 del mese corrente = ultimo giorno del mese precedente.
  return new Date(now.getFullYear(), now.getMonth(), 0);
}

// 31 dicembre dell'anno corrente.
function currentYearEnd(now) {
  return new Date(now.getFullYear(), 11, 31);
}

// Primo giorno del mese corrente: le colonne mensili partono da qui (il
// mese corrente è la prima colonna, subito dopo quelle fisse).
function startOfCurrentMonth(now) {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Chiave/etichetta di colonna per un mese, stesso formato "MM.AA" del
// tracciato di riferimento (es. "11.26" per novembre 2026).
function monthKey(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}.${yy}`;
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

// Debito residuo di un mutuo a una certa data: il remainingDebt dell'ultima
// rata con scadenza <= targetDate (le rate sono già ordinate per data). Se
// nessuna rata è ancora scaduta a quella data, il debito è ancora l'intero
// importo originario del mutuo.
function residualDebtAt(installmentsSortedByDate, targetDate, originalAmount) {
  let value = originalAmount;
  for (const installment of installmentsSortedByDate) {
    if (installment.dueDate.getTime() <= targetDate.getTime()) {
      value = installment.remainingDebt;
    } else {
      break;
    }
  }
  return value;
}

/**
 * Genera i dati dello scadenzario mutui di un cliente: una riga per mutuo
 * (non aggregato per banca), con:
 * - due colonne di debito residuo "dinamiche" (mese precedente / fine anno
 *   corrente, calcolate rispetto alla data corrente al momento della
 *   chiamata, non date fisse);
 * - una colonna per il mese corrente e ciascuno dei mesi successivi, fino
 *   all'ultima rata futura tra tutti i mutui del cliente, con la quota
 *   capitale di quel mese (0 se il mutuo non ha una rata in quel mese);
 * - i totali mensili (somma della quota capitale di tutti i mutui), per la
 *   riga "TOTALE" in fondo alla tabella.
 *
 * Funzione "wrapper" unica, usata sia per la tabella a video
 * (customerController.getLoanScheduleReport) sia per l'export XLSX
 * (customerController.exportLoanScheduleReport), così i due output non
 * possono mai disallinearsi.
 */
export async function buildLoanScheduleReport(customerId) {
  const now = new Date();
  const previousMonthEndDate = previousMonthEnd(now);
  const currentYearEndDate = currentYearEnd(now);
  const monthsRangeStart = startOfCurrentMonth(now);

  const loans = await Loan.find({ customerId }).sort({ createdAt: 1 });
  const bankIds = [...new Set(loans.map((loan) => loan.bankId.toString()))];
  const banks = await Bank.find({ _id: { $in: bankIds } });
  const bankNameById = new Map(banks.map((bank) => [bank._id.toString(), bank.name]));

  // Prima passata: carica le rate di ogni mutuo e individua il mese più
  // lontano tra tutte le rate future, per delimitare l'intervallo di colonne.
  const loansWithInstallments = [];
  let monthsRangeEnd = monthsRangeStart;
  for (const loan of loans) {
    const installments = await LoanInstallment.find({ loanId: loan._id }).sort({ dueDate: 1 });
    loansWithInstallments.push({ loan, installments });
    for (const installment of installments) {
      if (installment.dueDate >= monthsRangeStart && installment.dueDate > monthsRangeEnd) {
        monthsRangeEnd = installment.dueDate;
      }
    }
  }

  const months = [];
  for (let cursor = monthsRangeStart; cursor <= monthsRangeEnd; cursor = addMonths(cursor, 1)) {
    months.push(monthKey(cursor));
  }

  const totalsByMonth = Object.fromEntries(months.map((key) => [key, 0]));

  const rows = loansWithInstallments.map(({ loan, installments }) => {
    const firstInstallment = installments[0] ?? null;
    const lastInstallment = installments[installments.length - 1] ?? null;

    const monthlyPrincipal = {};
    for (const installment of installments) {
      if (installment.dueDate < monthsRangeStart) continue;
      const key = monthKey(installment.dueDate);
      monthlyPrincipal[key] = round2((monthlyPrincipal[key] ?? 0) + installment.principalAmount);
      totalsByMonth[key] = round2((totalsByMonth[key] ?? 0) + installment.principalAmount);
    }

    return {
      loanId: loan._id,
      bank: bankNameById.get(loan.bankId.toString()) ?? '—',
      label: loan.label,
      amount: loan.amount,
      durationMonths: installments.length || (loan.durationYears ? loan.durationYears * 12 : null),
      amortizationStart: firstInstallment?.dueDate ?? null,
      maturity: lastInstallment?.dueDate ?? null,
      residualDebtPreviousMonthEnd: residualDebtAt(installments, previousMonthEndDate, loan.amount),
      residualDebtCurrentYearEnd: residualDebtAt(installments, currentYearEndDate, loan.amount),
      monthlyPrincipal,
    };
  });

  const totalResidualDebtPreviousMonthEnd = round2(
    rows.reduce((sum, row) => sum + row.residualDebtPreviousMonthEnd, 0)
  );
  const totalResidualDebtCurrentYearEnd = round2(
    rows.reduce((sum, row) => sum + row.residualDebtCurrentYearEnd, 0)
  );

  return {
    generatedAt: now.toISOString(),
    previousMonthEndDate,
    currentYearEndDate,
    months,
    totalsByMonth,
    totalResidualDebtPreviousMonthEnd,
    totalResidualDebtCurrentYearEnd,
    rows,
  };
}
