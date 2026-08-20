# syntax=docker/dockerfile:1
#
# Nota: se usa "npm install" en vez de "npm ci". El proyecto trae paquetes
# con binarios nativos por plataforma (Tailwind/ESLint) cuyo lockfile,
# generado en Windows, no valida con la verificación estricta de "npm ci"
# dentro de un contenedor Linux — es un problema conocido de npm con
# optionalDependencies multiplataforma, no algo específico de este proyecto.
# "npm install" resuelve el árbol de nuevo sin ese problema.

# ---- deps: instala dependencias (capa cacheable mientras no cambie el lockfile) ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# ---- builder: compila la app ----
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/public
RUN npm run build

# ---- runner: imagen final, solo con lo necesario para correr ----
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Salida "standalone" de Next.js: server.js + node_modules mínimos, ya trazados.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# data/ tiene que quedar escribible: "Agregar partido" persiste ahí
# (data/imported-analysis-packages.json). Se monta como volumen en compose
# para que sobreviva a un rebuild del contenedor.
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
