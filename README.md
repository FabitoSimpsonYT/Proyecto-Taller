# Stack PERN con PostgreSQL - Docker By Fabián Mora

Stack completo con **PostgreSQL, Express, React y Node.js** orchestrado con Docker Compose.

## Estructura del Proyecto

```
.
├── backend/                    # API Node.js/Express
│   ├── package.json
│   ├── server.js
│   └── ...
├── frontend/                   # Aplicación React
│   ├── package.json
│   ├── public/
│   ├── src/
│   └── ...
├── scripts/                    # Scripts SQL de inicialización
│   └── init.sql
├── Dockerfile.backend          # Dockerfile para Express
├── Dockerfile.frontend         # Dockerfile para React
├── Dockerfile.postgres         # Dockerfile para PostgreSQL
├── docker-compose.yml          # Orquestación de servicios
├── nginx.conf                  # Configuración Nginx
├── .env.example                # Referencia de variables (no es necesario crear .env)
└── .dockerignore               # Archivos a ignorar en build
```

## Requisitos

- Docker (v20.10+)
- Docker Compose (v2.0+)

## Inicio Rápido

**Cero configuración requerida.** Todos los valores por defecto están configurados en `docker-compose.yml`.

Para cambiar valores (puerto, credenciales, etc.), crea un `.env` basado en `.env.example`:

```bash
cp .env.example .env
# Edita .env con tus valores personalizados
```

Pero para empezar inmediatamente, solo necesitas:

### 1. Clonar o descargar el proyecto

### 2. Ejecutar

```bash
# En background
docker-compose up -d

# Con logs en tiempo real
docker-compose up

# Reconstruir imágenes
docker-compose up --build
```

### 3. Detener servicios

```bash
docker-compose down

# Eliminar también volúmenes de datos
docker-compose down -v
```

## Acceso a Servicios

| Servicio | URL/Host | Puerto |
|----------|----------|--------|
| **Frontend (React)** | http://localhost:5173 | 5173 |
| **Backend (Express)** | http://localhost:5000 | 5000 |
| **PostgreSQL** | localhost | 5432 |

Credenciales PostgreSQL por defecto:
- Usuario: `pern_user`
- Contraseña: `pern_password`
- Base de datos: `pern_db`

## Comandos Útiles

### Estado de contenedores
```bash
docker-compose ps
```

### Logs en tiempo real
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Acceder a PostgreSQL
```bash
docker-compose exec postgres psql -U pern_user -d pern_db
```

### Detener contenedor específico
```bash
docker-compose stop backend
```

### Reiniciar
```bash
docker-compose restart
```

### Ejecutar comando en un contenedor
```bash
docker-compose exec backend npm install
docker-compose exec frontend npm install
```

### Acceder a PostgreSQL
```bash
docker-compose exec postgres psql -U pern_user -d pern_db
```

## Scripts de Inicialización SQL

Coloca archivos `.sql` en la carpeta `scripts/` para ejecutarlos automáticamente al iniciar PostgreSQL.

Ejemplo `scripts/init.sql`:
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES 
('Usuario Test', 'test@example.com');
```

## Optimizaciones Incluidas

- Multi-stage builds - Optimiza el tamaño de las imágenes
- Health checks - Monitoreo automático de servicios
- Volumes - Persistencia de datos en PostgreSQL
- Networking - Comunicación segura entre servicios
- Security headers - Headers de seguridad en Nginx
- Environment variables - Configuración flexible
- Estructura limpia - Solo archivos necesarios

## Valores por Defecto

Estos valores están automáticamente configurados en `docker-compose.yml` y los contenedores los usan de inmediato:

```
# PostgreSQL
POSTGRES_DB=pern_db
POSTGRES_USER=pern_user
POSTGRES_PASSWORD=pern_password
POSTGRES_PORT=5432

# Backend
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pern_db
DB_USER=pern_user
DB_PASSWORD=pern_password
NODE_ENV=production
API_PORT=5000

# Frontend
REACT_APP_API_URL=http://backend:5000
FRONTEND_PORT=5173
```

**Para customizarlos:** Copia `.env.example` a `.env` y edítalo antes de ejecutar `docker-compose up`.

```bash
cp .env.example .env
# Abre .env y cambia los valores que necesites
docker-compose up
```

## Troubleshooting

### La base de datos no se conecta
```bash
docker-compose down -v
docker-compose up --build
```

### Puerto ya en uso
Cambia los puertos en `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # PostgreSQL en puerto distinto
  - "5001:5000"  # Backend en puerto distinto
```

### Ver logs de error
```bash
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 postgres
```

## Desarrollo Local

Para desarrollo sin Docker:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm start
```

# MariaDB con tu cliente preferido
```

## Producción

Para producción, considera:

1. Usar variables de entorno seguras
2. Habilitar HTTPS en Nginx
3. Agregar autenticación a MariaDB
4. Usar image registry privado
5. Configurar backup automático de BD
6. Agregar monitoring y logging

---

**Hecho para Docker Taller**