import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import pg from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = process.env.PORT || 3000
const { Pool } = pg
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }) : null

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    if (pool) await pool.query('SELECT 1')
    res.json({ status: 'ok', database: Boolean(pool) })
  } catch { res.status(503).json({ status: 'error', database: false }) }
})

app.post('/api/auth/login', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DATABASE_URL no está configurada' })
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Correo y contraseña son obligatorios' })

  const { rows } = await pool.query(
    `SELECT id, full_name, email, role
     FROM users
     WHERE email = $1 AND password_hash = crypt($2, password_hash)`,
    [email.toLowerCase(), password],
  )
  if (!rows[0]) return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
  res.json({ user: rows[0] })
})

app.get('/api/entries', async (_req, res) => {
  if (!pool) return res.json([])
  const { rows } = await pool.query(`
    SELECT id, full_name, company, purpose, status, entry_at
    FROM access_entries
    ORDER BY entry_at DESC
    LIMIT 100
  `)
  res.json(rows)
})

app.post('/api/entries', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DATABASE_URL no está configurada' })
  const { full_name, company, purpose, created_by } = req.body
  if (!full_name) return res.status(400).json({ error: 'El nombre es obligatorio' })
  if (!company?.trim()) return res.status(400).json({ error: 'La empresa es obligatoria' })
  const { rows } = await pool.query(
    `INSERT INTO access_entries (full_name, company, purpose, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, company, purpose, status, entry_at`,
    [full_name, company.trim(), purpose || null, created_by || null],
  )
  res.status(201).json(rows[0])
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, '../dist')))
// Express 5 requiere un parámetro nombrado en las rutas comodín.
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))
app.listen(port, () => console.log(`app_accesos running on ${port}`))
