import { api } from '../../lib/axios.js';
import { makeCrudApi } from '../../lib/makeCrudApi.js';

export const customersApi = makeCrudApi('/customers');

// Auto-gestione: il customer vede/modifica solo il proprio profilo collegato.
export const getOwnCustomer = () => api.get('/customers/me').then((res) => res.data.item);
export const updateOwnCustomer = (data) =>
  api.patch('/customers/me', data).then((res) => res.data.item);
