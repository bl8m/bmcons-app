// Errore applicativo con status HTTP associato, da lanciare nei controller
// e nei middleware. Viene intercettato dall'errorHandler centralizzato.
export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
