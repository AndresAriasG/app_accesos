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

app.get('/api/entries', async (_req, res) => {
  if (!pool) return res.json([])
  const { rows } = await pool.query('SELECT * FROM access_entries ORDER BY entry_at DESC LIMIT 100')
  res.json(rows)
})

app.post('/api/entries', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DATABASE_URL no está configurada' })
  const { full_name, company, purpose } = req.body
  if (!full_name) return res.status(400).json({ error: 'El nombre es obligatorio' })
  const { rows } = await pool.query('INSERT INTO access_entries (full_name, company, purpose) VALUES ($1, $2, $3) RETURNING *', [full_name, company || null, purpose || null])
  res.status(201).json(rows[0])
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, '../dist')))
// Express 5 requiere un parámetro nombrado en las rutas comodín.
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))
app.listen(port, () => console.log(`app_accesos running on ${port}`))
