# Guía: Ejecutar Contenedores Docker en Paralelo (Sin Docker Compose)

Este proyecto incluye scripts para ejecutar los 3 contenedores Docker (Backend, Frontend y PostgreSQL) en paralelo sin utilizar Docker Compose.

## Requisitos Previos

- **Docker** instalado y ejecutándose
- **Docker CLI** disponible en la terminal
- Acceso a privilegios de docker (en Linux/Mac podría requerir `sudo`)

## Para Windows

### Iniciar los servicios:
```batch
run_containers.bat
```

Este script:
1. Crea una red Docker personalizada (`pern_network`)
2. Compila las 3 imágenes Docker
3. Inicia los contenedores en paralelo
4. Configura las variables de entorno correctas
5. Establece health checks para cada servicio

### Detener los servicios:
```batch
stop_containers.bat
```

## Para Linux/Mac

### Primero, dale permisos de ejecución a los scripts:
```bash
chmod +x run_containers.sh
chmod +x stop_containers.sh
```

### Iniciar los servicios:
```bash
./run_containers.sh
```

### Detener los servicios:
```bash
./stop_containers.sh
```

## URLs de Acceso

Una vez que todo esté corriendo:

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Frontend** | http://localhost | 80 |
| **Backend API** | http://localhost:5000 | 5000 |
| **PostgreSQL** | localhost:5432 | 5432 |

## Variables de Entorno

### Backend
```
NODE_ENV=production
DB_HOST=pern_postgres (nombre del contenedor)
DB_PORT=5432
DB_NAME=pern_db
DB_USER=pern_user
DB_PASSWORD=pern_password
API_PORT=5000
```

### Frontend
```
REACT_APP_API_URL=http://localhost:5000
```

### PostgreSQL
```
POSTGRES_DB=pern_db
POSTGRES_USER=pern_user
POSTGRES_PASSWORD=pern_password
```

## 🔍 Monitorear Contenedores

Ver estado de los contenedores:
```bash
docker ps
```

Ver logs de un contenedor específico:
```bash
# Backend
docker logs pern_backend -f

# Frontend
docker logs pern_frontend -f

# PostgreSQL
docker logs pern_postgres -f
```

Ver estado de salud:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 🌐 Red Docker

Los 3 contenedores están conectados a través de una red Bridge personalizada llamada `pern_network`, lo que permite:

- Comunicación entre contenedores usando sus nombres como hostnames
- El Backend puede conectarse a PostgreSQL usando `pern_postgres:5432`
- El Frontend accede al Backend en el host local: `http://localhost:5000`

## ⚠️ Notas Importantes

1. **Orden de inicio:** PostgreSQL se inicia primero, luego Backend, luego Frontend
2. **Health checks:** Cada contenedor tiene health checks configurados
3. **Volúmenes:** Los datos de PostgreSQL se persisten en un volumen named `postgres_data`
4. **Puertos:** Asegúrate de que los puertos 80, 5000 y 5432 estén disponibles
5. **Base de datos:** Los scripts SQL en `./scripts/` se ejecutarán automáticamente al iniciar PostgreSQL

## 🛑 Limpiar Recursos

Para eliminar completamente todo (contenedores, red, volúmenes):

```bash
# Windows
stop_containers.bat

# Linux/Mac
./stop_containers.sh

# Luego eliminar el volumen (opcional)
docker volume rm postgres_data
```

## 🐛 Troubleshooting

### Error: "Port is already in use"
```bash
# Encuentra qué proceso está usando el puerto
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000

# Libera el puerto deteniendo ese proceso o cambia el puerto en los scripts
```

### Error: "Cannot connect to Docker"
- Verifica que Docker Desktop esté ejecutándose (Windows/Mac)
- En Linux, verifica que el servicio Docker esté activo: `sudo systemctl start docker`

### Backend no puede conectarse a PostgreSQL
- Espera unos segundos a que PostgreSQL esté completamente listo
- Verifica que ambos contenedores estén en la misma red: `docker network inspect pern_network`
- Comprueba los logs: `docker logs pern_postgres`

### Frontend no puede acceder al Backend
- Verifica que la variable `REACT_APP_API_URL` esté correctamente configurada
- Asegúrate de que el Backend está corriendo: `docker ps`
- Comprueba los logs del Backend: `docker logs pern_backend`

---

**Ventajas sobre Docker Compose:**
- Control explícito del orden de inicio
- Mejor visualización del proceso de compilación
- Fácil personalización y debugging
- Menor complejidad para proyectos simples
