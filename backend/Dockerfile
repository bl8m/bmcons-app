# --- Stage: base ---
FROM node:20-alpine AS base
WORKDIR /app
# python3/make/g++: necessari a node-gyp se argon2 non trova un binario precompilato per musl
RUN apk add --no-cache python3 make g++
COPY package*.json ./

# --- Stage: dev (hot reload con nodemon, sorgenti montati come volume) ---
FROM base AS dev
ENV NODE_ENV=development
RUN npm install
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
EXPOSE 4000
USER node
CMD ["node", "src/server.js"]
