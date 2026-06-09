# MariaDB Database
FROM mariadb:10.11

# Establecer variables de entorno por defecto
ENV MARIADB_DATABASE=taller_db
ENV MARIADB_USER=taller_user
ENV MARIADB_PASSWORD=taller_password
ENV MARIADB_ROOT_PASSWORD=root_root_password

# Copiar scripts de inicialización
COPY init.sql /docker-entrypoint-initdb.d/

# Exponer puerto
EXPOSE 3306

# Health check usando mariadb-admin ping
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD mariadb-admin ping -h localhost || exit 1
