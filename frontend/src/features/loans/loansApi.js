import { api } from '../../lib/axios.js';
import { makeCrudApi } from '../../lib/makeCrudApi.js';

export const loansApi = makeCrudApi('/loans');

// Upload multipart: niente Content-Type manuale, axios imposta da solo il
// boundary corretto quando il body è un FormData.
export const importLoanInstallmentsFromPdf = (loanId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/loans/${loanId}/import-installments`, formData).then((res) => res.data);
};
