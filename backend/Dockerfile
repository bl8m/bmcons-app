# --- Stage: base ---
FROM node:20-alpine AS base
WORKDIR /app
# python3/make/g++: necessari a node-gyp se argon2 non trova un binario precompilato per musl
RUN apk add --no-cache python3 make g++
COPY package*.json ./

# --- Stage: dev (hot reload con nodemon, sorgenti montati come volume) ---
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

# --- Stage: dependencies solo produzione ---
FROM base AS deps
RUN npm ci --omit=dev

# --- Stage: production ---
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# .dockerignore esclude uploads/ dall'immagine: la cartella va creata qui e
# assegnata a "node" PRIMA di passare a quell'utente, altrimenti il volume
# montato in produzione su /app/uploads verrebbe creato di proprietà di root
# al primo avvio, e il processo (non root) non potrebbe scriverci dentro.
RUN mkdir -p /app/uploads/attachments && chown -R node:node /app/uploads
EXPOSE 4000
USER node
CMD ["node", "src/server.js"]
