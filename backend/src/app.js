import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const app = express();

// Necessario dietro un reverse proxy con un solo hop (es. Traefik su
// Dokploy): permette a Express (e a express-rate-limit) di ricavare il vero
// IP del client da X-Forwarded-For invece di vedere sempre l'IP del proxy —
// senza questo, express-rate-limit applicherebbe il limite a TUTTI gli
// utenti insieme come se fossero un solo client. In locale, senza un proxy
// davanti, l'header non è presente e non cambia nulla.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rate limit più stringente sulle rotte di autenticazione, per mitigare
// tentativi di brute-force sul login.
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);
