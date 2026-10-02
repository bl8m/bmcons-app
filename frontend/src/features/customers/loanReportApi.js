import { api } from '../../lib/axios.js';

export const getLoanScheduleReport = (customerId) =>
  api.get(`/customers/${customerId}/loan-report`).then((res) => res.data);

// responseType "blob": il contenuto del file XLSX da far scaricare al browser.
export const downloadLoanScheduleReportXlsx = (customerId) =>
  api
    .get(`/customers/${customerId}/loan-report/export`, { responseType: 'blob' })
    .then((res) => res.data);
