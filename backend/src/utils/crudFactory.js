import { asyncHandler } from './asyncHandler.js';
import { ApiError } from './ApiError.js';

// Genera i 5 handler CRUD standard (list/getOne/create/update/remove) per un
// modello Mongoose. Usato dalle entità ANAGRAFICHE che condividono la stessa
// logica di base (indirizzi, telefoni, email, conti correnti, ...).
//
// req.resourceFilter, se presente (impostato da middleware come
// scopeToOwnCustomer), viene unito ai filtri di lettura/scrittura per
// limitare l'accesso ai soli record di competenza dell'utente.
//
// sort: ordinamento della lista, di default per data di creazione più
// recente; può essere personalizzato (es. le rate mutuo per scadenza).
export function createCrudHandlers(Model, { entityName = 'Elemento', sort = { createdAt: -1 } } = {}) {
  const list = asyncHandler(async (req, res) => {
    const items = await Model.find(req.resourceFilter ?? {}).sort(sort);
    res.json({ items });
  });

  const getOne = asyncHandler(async (req, res) => {
    const item = await Model.findOne({ _id: req.params.id, ...(req.resourceFilter ?? {}) });
    if (!item) throw new ApiError(404, `${entityName} non trovato`);
    res.json({ item });
  });

  const create = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json({ item });
  });

  const update = asyncHandler(async (req, res) => {
    const item = await Model.findOneAndUpdate(
      { _id: req.params.id, ...(req.resourceFilter ?? {}) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) throw new ApiError(404, `${entityName} non trovato`);
    res.json({ item });
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findOneAndDelete({ _id: req.params.id, ...(req.resourceFilter ?? {}) });
    if (!item) throw new ApiError(404, `${entityName} non trovato`);
    res.status(204).send();
  });

  return { list, getOne, create, update, remove };
}
