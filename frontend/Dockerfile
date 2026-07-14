# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el código
COPY . .

# Build de la aplicación React
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar configuración personalizada de nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build de React
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar script de entrada para configuración en runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Iniciar nginx con configuración dinámica
ENTRYPOINT ["/docker-entrypoint.sh"]
