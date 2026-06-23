-- Ejecuta esta migración si ya aplicaste database/schema.sql anteriormente.
-- Conserva registros históricos sin empresa con una etiqueta explícita.
UPDATE access_entries
SET company = 'No especificada'
WHERE company IS NULL OR BTRIM(company) = '';

ALTER TABLE access_entries
ALTER COLUMN company SET NOT NULL;
