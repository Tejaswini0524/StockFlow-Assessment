
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import db from '../db.js'
import { signToken, requireAuth } from '../auth.js'

const router = Router()

router.post('/signup', async (req, res, next) => {
  const client = await db.connect()

  try {
    const { email, password, orgName, firstName, lastName, phone, address } = req.body

    if (!email || !password || !orgName || !firstName || !lastName) {
      return res.status(400).json({ error: 'Please fill in all required fields' })
    }

    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existing.rows.length) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const orgId = randomUUID()
    const userId = randomUUID()

    await client.query('BEGIN')

    await client.query(
      'INSERT INTO organizations (id, name) VALUES ($1, $2)',
      [orgId, orgName]
    )

    await client.query(`
      INSERT INTO users
      (id, email, password_hash, first_name, last_name, phone, address, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      userId, email, passwordHash, firstName, lastName,
      phone || null, address || null, orgId
    ])

    await client.query('COMMIT')

    const token = signToken(userId, orgId)
    res.json({ token })
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    next(e)
  } finally {
    client.release()
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    const user = result.rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = signToken(user.id, user.organization_id)
    res.json({ token })
  } catch (e) {
    next(e)
  }
})

router.post('/logout', (req, res) => res.json({ success: true }))

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.first_name, u.last_name,
             u.organization_id, o.name AS org_name
      FROM users u
      JOIN organizations o ON o.id = u.organization_id
      WHERE u.id = $1
    `, [req.session.userId])

    res.json(result.rows[0])
  } catch (e) {
    next(e)
  }
})

export default router
