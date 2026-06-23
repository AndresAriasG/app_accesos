-- app_accesos · PostgreSQL / Railway
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(160) NOT NULL,
  company VARCHAR(160) NOT NULL,
  purpose VARCHAR(250) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'inside' CHECK (status IN ('inside', 'exited')),
  entry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exit_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS access_entries_entry_at_idx ON access_entries (entry_at DESC);
CREATE INDEX IF NOT EXISTS access_entries_status_idx ON access_entries (status);

-- Usuario inicial para el acceso administrativo.
-- Credenciales iniciales: admin@appaccesos.com / Acceso2026!
-- Cambia esta contraseña apenas tengas acceso al panel en producción.
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
  'Administrador',
  'admin@appaccesos.com',
  crypt('Acceso2026!', gen_salt('bf')),
  'admin'
)
ON CONFLICT (email) DO NOTHING;
