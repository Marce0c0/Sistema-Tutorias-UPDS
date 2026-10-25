# ==============================================================================
# Dockerfile Multi-Stage — Backend Node.js / Express / TypeScript (UPDS)
# Cumple con el estándar de seguridad y optimización de imagen (Punto 10)
# ==============================================================================

# ─── Etapa 1: Compilación y Generación de Tipos (Builder) ────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilar Prisma en Alpine
RUN apk add --no-cache openssl libc6-compat

# Copiar manifiestos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN npm install

# Generar el cliente de Prisma tipado
RUN npx prisma generate

# Copiar código fuente y configuración de TypeScript
COPY tsconfig.json ./
COPY src ./src/

# Compilar TypeScript a JavaScript vanilla en ./dist
RUN npm run build


# ─── Etapa 2: Entorno de Producción Mínimo y Seguro (Production) ─────────────
FROM node:20-alpine AS production

WORKDIR /app

# Instalar librerías de runtime necesarias para Prisma Client
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=3001

# Copiar manifiestos e instalar ÚNICAMENTE dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiar artefactos compilados y Prisma Client generado desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Seguridad: Ejecutar como usuario no-root por principio de menor privilegio
USER node

# Exponer el puerto del backend
EXPOSE 3001

# Comando de arranque del servidor
CMD ["node", "dist/server.js"]
