# BM Cons

Web application composta da:

- **backend/** — API REST in Node.js/Express + Mongoose (MongoDB), autenticazione JWT con ruoli (`administrator`, `customer`), integrazione con l'API di Anthropic (Claude) per l'estrazione di tabelle da PDF.
- **frontend/** — React + Tailwind CSS + Zustand + React Router.

## Stack

| Livello | Tecnologie |
|---|---|
| Backend | Express, Mongoose, MongoDB, JWT (access + refresh token), argon2, zod, multer, `@anthropic-ai/sdk` |
| Frontend | React, Vite, Tailwind CSS, Zustand, React Router, React Hook Form |
| Infra | Docker, docker-compose, MongoDB, Mongo Express (UI dev) |

## Avvio in locale (Docker)

1. Copia i file d'esempio delle variabili d'ambiente:

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Personalizza almeno:
   - `backend/.env`: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (es. `openssl rand -hex 64`), `ADMIN_EMAIL`/`ADMIN_PASSWORD`, `ANTHROPIC_API_KEY`.
   - Le credenziali Mongo devono combaciare tra `.env` (root) e `backend/.env` (`MONGO_URI`).

3. Avvia tutti i container:

   ```bash
   docker compose up --build
   ```

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api
   - Mongo Express (UI database, solo dev): http://localhost:8081

4. Crea l'utente amministratore iniziale:

   ```bash
   docker compose exec backend npm run seed
   ```

> ⚠️ **Cambio password Mongo dopo il primo avvio**: `MONGO_INITDB_ROOT_USERNAME/PASSWORD` vengono applicati da MongoDB solo alla creazione iniziale del volume dati. Se cambi le credenziali Mongo nei `.env` dopo aver già avviato lo stack una volta, serve anche `docker compose down -v` (rigenera il volume da zero, perdendo i dati) oppure aggiornare la password manualmente via `mongosh` — altrimenti backend e mongo-express falliranno l'autenticazione con `storedKey mismatch`.

## Struttura del backend

```
backend/src/
  config/        # env, connessione MongoDB
  models/        # schema Mongoose (User, ...)
  middleware/    # auth (JWT), RBAC, validazione, error handler
  controllers/   # logica delle rotte
  services/      # auth, token, integrazione Anthropic
  routes/        # definizione endpoint REST
  validators/    # schema zod di validazione input
  seed/          # script di inizializzazione dati
```

### Autenticazione

- Login con email/password (hash argon2) → access token JWT (15 min) + refresh token JWT (7gg) in cookie `httpOnly`.
- `POST /api/auth/refresh` rinnova l'access token; il frontend lo richiama automaticamente su una risposta 401.
- Ruoli gestiti tramite il middleware `requireRole('administrator' | 'customer')`.

### Estrazione tabelle da PDF (Anthropic)

`POST /api/documents/extract` (autenticato) accetta un PDF (`multipart/form-data`, campo `file`), lo invia a Claude e restituisce le tabelle estratte come JSON strutturato (`backend/src/services/anthropicService.js`). Lo schema di output è generico (`genericTableSchema`) e andrà specializzato per tipo di documento quando le entità di dominio saranno definite.

## Struttura del frontend

```
frontend/src/
  components/    # UI riutilizzabile (Button, Input, Card, Spinner, ...)
  features/      # moduli per dominio (auth/, ...)
  layouts/       # AdminLayout, CustomerLayout
  routes/        # AppRoutes, ProtectedRoute (guardie per ruolo)
  pages/         # pagine applicative
  lib/           # istanza axios con refresh automatico del token
```

Colori del tema (`tailwind.config.js`): primario `#e11117`, testo `#707374`.

## Sviluppo senza Docker

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

Richiede un'istanza MongoDB raggiungibile (locale o via `docker compose up mongodb`).
