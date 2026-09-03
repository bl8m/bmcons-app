import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/tokenService.js';

// Verifica l'access token nell'header Authorization e popola req.user
// con { id, role }. Non tocca il database: per questo l'access token
// resta volutamente di breve durata (vedi JWT_ACCESS_EXPIRES).
export const authenticate = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Autenticazione richiesta'));
  }

  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, 'Access token non valido o scaduto'));
  }
};

// Middleware factory per il controllo dei ruoli (RBAC).
// Uso: router.get('/admin-only', authenticate, requireRole('administrator'), handler)
export const requireRole =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Non hai i permessi per accedere a questa risorsa'));
    }
    next();
  };
