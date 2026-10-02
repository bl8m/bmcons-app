import { api } from '../../lib/axios.js';
import { makeCrudApi } from '../../lib/makeCrudApi.js';

export const customersApi = makeCrudApi('/customers');

// Auto-gestione: il customer vede/modifica solo il proprio profilo collegato.
export const getOwnCustomer = () => api.get('/customers/me').then((res) => res.data.item);
export const updateOwnCustomer = (data) =>
  api.patch('/customers/me', data).then((res) => res.data.item);

// Importa una visura camerale: crea un nuovo cliente con i dati estratti via
// Claude, più indirizzi/telefoni/email collegati. L'aggiornamento di un
// cliente già esistente verrà aggiunto in seguito.
export const importVisura = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/customers/import-visura', formData).then((res) => res.data);
};
