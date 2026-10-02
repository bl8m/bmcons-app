import { api } from '../../lib/axios.js';

export const listAttachments = (attachableType, attachableId) =>
  api
    .get('/attachments', { params: { attachableType, attachableId } })
    .then((res) => res.data.items);

export const uploadAttachment = (attachableType, attachableId, file, { name, version } = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('attachableType', attachableType);
  formData.append('attachableId', attachableId);
  if (name) formData.append('name', name);
  if (version) formData.append('version', version);
  return api.post('/attachments', formData).then((res) => res.data.item);
};

// responseType "blob": il contenuto del file, non un oggetto dati applicativo.
export const downloadAttachment = (id) =>
  api.get(`/attachments/${id}/download`, { responseType: 'blob' }).then((res) => res.data);

export const deleteAttachment = (id) => api.delete(`/attachments/${id}`);
