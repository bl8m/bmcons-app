// Evita try/catch ripetuti in ogni controller async: inoltra automaticamente
// gli errori a next() così finiscono nell'errorHandler centralizzato.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
