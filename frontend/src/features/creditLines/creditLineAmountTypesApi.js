import { api } from '../../lib/axios.js';

// creditLineTypeId: non ancora utilizzato dal backend, ma già accettato per
// quando la lista dipenderà dalla tipologia di affidamento selezionata.
export const getCreditLineAmountTypes = (creditLineTypeId) =>
  api
    .get('/credit-line-amount-types', { params: creditLineTypeId ? { creditLineTypeId } : undefined })
    .then((res) => res.data.items);
