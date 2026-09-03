import { ApiError } from '../utils/ApiError.js';

// Middleware factory: valida req.body con lo schema zod passato e sostituisce
// req.body con i dati "parsati" (tipizzati/normalizzati) in caso di successo.
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(new ApiError(400, 'Dati non validi', result.error.flatten().fieldErrors));
  }

  req.body = result.data;
  next();
};
