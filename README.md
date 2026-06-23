# app_accesos

Dashboard de control de ingresos construido con React + Vite y una API Express preparada para PostgreSQL en Railway.

## Desarrollo

```bash
npm install
npm run dev
```

## Railway

1. Crea un servicio PostgreSQL en Railway y añade `DATABASE_URL` a las variables del proyecto.
2. Ejecuta `database/schema.sql` y luego `database/seed-admin.sql` en la consola SQL de Railway.
   Si ya ejecutaste el esquema, aplica después `database/migrations/001-company-required.sql`.
   Para exigir el motivo de visita en registros existentes, aplica también `database/migrations/003-purpose-required.sql`.
3. Despliega este repositorio. Railway ejecuta `npm run build` y `npm start` automáticamente gracias a `railway.json`.

El script crea el usuario inicial `admin@appaccesos.com` con contraseña `Acceso2026!`. Cámbiala al completar el despliegue.

La API incluye `POST /api/auth/login`, `GET /api/health`, `GET /api/entries` y `POST /api/entries`.
