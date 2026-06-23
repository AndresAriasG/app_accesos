-- Actualiza el correo del usuario inicial en instalaciones existentes.
UPDATE users
SET email = 'admin@appaccesos.com'
WHERE email = 'admin@app_accesos.com';
