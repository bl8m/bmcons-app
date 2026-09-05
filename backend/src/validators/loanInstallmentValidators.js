import { z } from 'zod';
import { requiredMoney, requiredInteger, optionalMoneyWithDefault } from './common.js';

export const createLoanInstallmentSchema = z.object({
  loanId: z.string().trim().min(1, 'Mutuo obbligatorio'),
  number: requiredInteger('Numero rata obbligatorio'),
  dueDate: z.coerce.date(),
  amount: requiredMoney('Importo obbligatorio'),
  principalAmount: requiredMoney('Quota capitale obbligatoria'),
  interestAmount: requiredMoney('Quota interessi obbligatoria'),
  remainingDebt: requiredMoney('Debito residuo obbligatorio'),
  fees: optionalMoneyWithDefault(0),
  isPaid: z.boolean().optional().default(false),
});

export const updateLoanInstallmentSchema = createLoanInstallmentSchema.partial();
