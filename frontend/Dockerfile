# --- Stage: base ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Stage: dev (Vite dev server con hot reload, sorgenti montati come volume) ---
FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# --- Stage: build (bundle statico di produzione) ---
FROM base AS build
# Vite "incorpora" le variabili VITE_* nel bundle al momento della build, non
# a runtime: .env è escluso dal contesto Docker (.dockerignore), quindi deve
# arrivare come build arg (vedi docker-compose.prod.yml: build.args).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm ci
COPY . .
RUN npm run build

# --- Stage: production (servito da nginx) ---
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
