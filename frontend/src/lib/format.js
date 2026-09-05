export const formatCurrency = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
    : '—';

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString('it-IT') : '—');
