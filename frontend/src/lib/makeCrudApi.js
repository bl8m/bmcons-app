import { api } from './axios.js';

// Factory per le funzioni CRUD standard (list/create/update/remove) di una
// risorsa REST che segue la convenzione { items } / { item } del backend.
// Riutilizzata da tutte le sezioni ANAGRAFICHE.
export const makeCrudApi = (basePath) => ({
  // params: query string opzionale (es. { customerId } per filtrare lato admin)
  list: (params) => api.get(basePath, { params }).then((res) => res.data.items),
  create: (data) => api.post(basePath, data).then((res) => res.data.item),
  update: (id, data) => api.patch(`${basePath}/${id}`, data).then((res) => res.data.item),
  remove: (id) => api.delete(`${basePath}/${id}`),
});
