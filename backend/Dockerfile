# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Etapa 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar herramientas útiles
RUN apk add --no-cache curl

# Copiar las dependencias de la etapa anterior
COPY --from=builder /app/node_modules ./node_modules

# Copiar el código de la aplicación
COPY . .

# Exponer el puerto (cambiar si usa otro puerto)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Iniciar la aplicación
CMD ["node", "src/server.js"]
