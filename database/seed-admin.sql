-- Usuario administrador inicial · app_accesos
-- Ejecuta este archivo después de database/schema.sql
-- Acceso: admin@appaccesos.com / Acceso2026!

INSERT INTO users (full_name, email, password_hash, role)
VALUES (
  'Administrador',
  'admin@appaccesos.com',
  crypt('Acceso2026!', gen_salt('bf')),
  'admin'
)
ON CONFLICT (email) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;
