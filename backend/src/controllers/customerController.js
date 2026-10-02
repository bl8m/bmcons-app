import { Customer } from '../models/Customer.js';
import { Address } from '../models/Address.js';
import { Phone } from '../models/Phone.js';
import { EmailAddress } from '../models/EmailAddress.js';
import { BankAccount } from '../models/BankAccount.js';
import { Loan } from '../models/Loan.js';
import { LoanInstallment } from '../models/LoanInstallment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteAttachmentsFor } from '../services/attachmentService.js';
import { extractVisuraDataFromPdf } from '../services/anthropicService.js';
import { buildLoanScheduleReport } from '../services/loanReportService.js';
import { createCustomerSchema } from '../validators/customerValidators.js';
import ExcelJS from 'exceljs';

const formatDateIt = (date) =>
  date
    ? new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : '—';

// Campi "semplici" del cliente popolabili dall'estrazione della visura:
// vengono applicati solo quelli per cui è stato effettivamente estratto un
// valore, lasciando intatto il resto della scheda.
const VISURA_CUSTOMER_FIELDS = [
  'companyName',
  'vatNumber',
  'taxCode',
  'legalRepresentativeFirstName',
  'legalRepresentativeLastName',
  'legalRepresentativeTaxCode',
  'subscribedShareCapital',
  'businessStartDate',
  'administrationSystem',
  'businessActivity',
];

// --- Gestione amministratore (tutti i clienti) ---

export const listCustomers = asyncHandler(async (_req, res) => {
  const items = await Customer.find().sort({ createdAt: -1 });
  res.json({ items });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Cliente non trovato');
  res.json({ item });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.create(req.body);
  res.status(201).json({ item });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new ApiError(404, 'Cliente non trovato');
  res.json({ item });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, 'Cliente non trovato');

  // I dati collegati (indirizzi, telefoni, mutui, ...) appartengono
  // esclusivamente a questo cliente: vanno rimossi insieme a lui. deleteMany
  // non innesca l'hook di cascade del modello Loan, quindi le rate dei suoi
  // mutui vanno cancellate esplicitamente qui.
  const loanIds = await Loan.find({ customerId: item._id }).distinct('_id');

  await Promise.all([
    Address.deleteMany({ customerId: item._id }),
    Phone.deleteMany({ customerId: item._id }),
    EmailAddress.deleteMany({ customerId: item._id }),
    BankAccount.deleteMany({ customerId: item._id }),
    Loan.deleteMany({ customerId: item._id }),
    LoanInstallment.deleteMany({ loanId: { $in: loanIds } }),
    deleteAttachmentsFor('Customer', item._id),
  ]);

  res.status(204).send();
});

// --- Auto-gestione (customer sul proprio profilo) ---

export const getOwnCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findOne({ userId: req.user.id });
  res.json({ item }); // null se nessun profilo è ancora stato collegato
});

export const updateOwnCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findOneAndUpdate({ userId: req.user.id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new ApiError(404, 'Nessun profilo associato al tuo account');
  res.json({ item });
});

// --- Importazione visura camerale ---

// Crea un indirizzo solo se è stato estratto almeno un dato minimo
// (altrimenti si rischia di creare record vuoti/inutili).
async function createAddressIfPresent(customerId, { label, isPrimary, ...fields }) {
  if (!fields.street && !fields.city) return null;
  return Address.create({
    customerId,
    label,
    isPrimary,
    street: fields.street || '—',
    city: fields.city || '—',
    postalCode: fields.postalCode,
    province: fields.province,
    country: fields.country,
  });
}

// Per ora l'importazione crea sempre un nuovo cliente: l'aggiornamento di un
// cliente già esistente a partire da una visura verrà aggiunto in seguito.
export const importVisura = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Nessun file ricevuto (campo "file")');
  }
  if (req.file.mimetype !== 'application/pdf') {
    throw new ApiError(400, 'Il file deve essere un PDF');
  }

  const extracted = await extractVisuraDataFromPdf(req.file.buffer);

  if (!extracted.companyName) {
    throw new ApiError(422, 'Non è stato possibile individuare la ragione sociale nel documento');
  }

  // Applica solo i campi "semplici" per cui l'estrazione ha trovato un
  // valore, validandoli/normalizzandoli con lo stesso schema usato per la
  // creazione manuale (arrotondamento importi, conversione data, ecc.).
  const customerData = {};
  for (const field of VISURA_CUSTOMER_FIELDS) {
    const value = extracted[field];
    if (value !== undefined && value !== '') {
      customerData[field] = value;
    }
  }
  if (extracted.shareholders?.length) customerData.shareholders = extracted.shareholders;
  if (extracted.administrators?.length) customerData.administrators = extracted.administrators;

  const parsed = createCustomerSchema.safeParse(customerData);
  if (!parsed.success) {
    throw new ApiError(422, 'I dati estratti dal documento non sono validi');
  }

  const customer = await Customer.create(parsed.data);

  // La sede legale segue sempre le stesse regole: etichetta fissa e
  // principale (il plugin "principale esclusivo" di Address si occupa di
  // togliere il flag da eventuali indirizzi già marcati come tali).
  const addresses = [];
  const registeredOffice = await createAddressIfPresent(customer._id, {
    label: 'Sede legale',
    isPrimary: true,
    ...(extracted.registeredOffice ?? {}),
  });
  if (registeredOffice) addresses.push(registeredOffice);

  for (const office of extracted.secondaryOffices ?? []) {
    const address = await createAddressIfPresent(customer._id, {
      label: office.label || 'Sede secondaria',
      isPrimary: false,
      ...office,
    });
    if (address) addresses.push(address);
  }

  const phones = [];
  for (const phone of extracted.phones ?? []) {
    if (!phone.number) continue;
    phones.push(
      await Phone.create({ customerId: customer._id, label: phone.label || 'Telefono', number: phone.number })
    );
  }

  const emails = [];
  for (const email of extracted.emails ?? []) {
    if (!email.email) continue;
    emails.push(
      await EmailAddress.create({
        customerId: customer._id,
        label: email.label || 'Email',
        email: email.email,
      })
    );
  }

  res.status(201).json({
    item: customer,
    addressesCreated: addresses.length,
    phonesCreated: phones.length,
    emailsCreated: emails.length,
  });
});

// --- Scadenzario mutui (report) ---

// Stessa funzione wrapper per la tabella a video e per l'export XLSX: le
// due viste non possono mai disallinearsi sui dati o sulla logica delle
// colonne "dinamiche" (mese precedente / fine anno corrente).
export const getLoanScheduleReport = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Cliente non trovato');

  const report = await buildLoanScheduleReport(customer._id);

  res.json({
    generatedAt: report.generatedAt,
    previousMonthEndLabel: formatDateIt(report.previousMonthEndDate),
    currentYearEndLabel: formatDateIt(report.currentYearEndDate),
    months: report.months,
    totalsByMonth: report.totalsByMonth,
    totalResidualDebtPreviousMonthEnd: report.totalResidualDebtPreviousMonthEnd,
    totalResidualDebtCurrentYearEnd: report.totalResidualDebtCurrentYearEnd,
    rows: report.rows,
  });
});

export const exportLoanScheduleReport = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Cliente non trovato');

  const report = await buildLoanScheduleReport(customer._id);
  const previousMonthEndLabel = formatDateIt(report.previousMonthEndDate);
  const currentYearEndLabel = formatDateIt(report.currentYearEndDate);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Scadenzario mutui');

  sheet.columns = [
    { header: 'Banca', key: 'bank', width: 20 },
    { header: 'Mutuo', key: 'label', width: 25 },
    { header: 'Importo originario', key: 'amount', width: 18 },
    { header: 'Durata (mesi)', key: 'durationMonths', width: 15 },
    { header: 'Inizio ammortamento', key: 'amortizationStart', width: 18 },
    { header: 'Scadenza', key: 'maturity', width: 18 },
    { header: `Debito residuo al ${previousMonthEndLabel}`, key: 'residualDebtPreviousMonthEnd', width: 24 },
    { header: `Debito residuo al ${currentYearEndLabel}`, key: 'residualDebtCurrentYearEnd', width: 24 },
    // Una colonna per ciascun mese futuro (quota capitale), stessa logica
    // della tabella a video.
    ...report.months.map((month) => ({ header: month, key: `month_${month}`, width: 12 })),
  ];
  sheet.getRow(1).font = { bold: true };

  for (const row of report.rows) {
    const monthlyValues = Object.fromEntries(
      report.months.map((month) => [`month_${month}`, row.monthlyPrincipal[month] ?? null])
    );
    sheet.addRow({
      ...row,
      amortizationStart: row.amortizationStart ? new Date(row.amortizationStart) : null,
      maturity: row.maturity ? new Date(row.maturity) : null,
      ...monthlyValues,
    });
  }

  // Riga finale con il totale mensile (somma della quota capitale di tutti i
  // mutui), come nel tracciato di riferimento.
  const totalsRow = sheet.addRow({
    bank: 'TOTALE',
    residualDebtPreviousMonthEnd: report.totalResidualDebtPreviousMonthEnd,
    residualDebtCurrentYearEnd: report.totalResidualDebtCurrentYearEnd,
    ...Object.fromEntries(report.months.map((month) => [`month_${month}`, report.totalsByMonth[month]])),
  });
  totalsRow.font = { bold: true };

  sheet.getColumn('amount').numFmt = '#,##0.00 €';
  sheet.getColumn('residualDebtPreviousMonthEnd').numFmt = '#,##0.00 €';
  sheet.getColumn('residualDebtCurrentYearEnd').numFmt = '#,##0.00 €';
  sheet.getColumn('amortizationStart').numFmt = 'dd/mm/yyyy';
  sheet.getColumn('maturity').numFmt = 'dd/mm/yyyy';
  for (const month of report.months) {
    sheet.getColumn(`month_${month}`).numFmt = '#,##0.00 €';
  }

  const safeCompanyName = customer.companyName.replace(/[^\w.-]+/g, '_');
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `scadenzario-mutui-${safeCompanyName}-${timestamp}.xlsx`;

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
});
