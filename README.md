# Gestión de películas y usuarios

## Configuración de la base de datos

La aplicación usa PostgreSQL. Define `DATABASE_URL` con la URL de conexión de tu base de datos y ejecuta el esquema inicial desde la raíz del proyecto:

```sh
psql "$DATABASE_URL" -f db/0001_initial_schema.sql
```

Después, inicia la aplicación:

```sh
pnpm dev
```
