-- Ejecuta esta migración si ya aplicaste database/schema.sql anteriormente.
UPDATE access_entries
SET purpose = 'Sin especificar'
WHERE purpose IS NULL OR BTRIM(purpose) = '';

ALTER TABLE access_entries
ALTER COLUMN purpose SET NOT NULL;
