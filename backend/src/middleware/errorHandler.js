import { ApiError } from '../utils/ApiError.js';

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Risorsa non trovata: ${req.method} ${req.originalUrl}`));
};

// Deve avere 4 argomenti: è così che Express lo riconosce come error handler.
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  // Email duplicata su indice unico Mongo
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Risorsa già esistente', details: err.keyValue });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  console.error('Errore non gestito:', err);
  res.status(500).json({ message: 'Errore interno del server' });
};
