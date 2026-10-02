import { api } from '../../lib/axios.js';

// responseType "blob": la risposta è il file JSON da far scaricare al
// browser, non un oggetto da leggere come dati applicativi.
export const exportBackup = () =>
  api.get('/admin/backups/export', { responseType: 'blob' }).then((res) => res.data);

export const importBackup = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/admin/backups/import', formData).then((res) => res.data);
};
