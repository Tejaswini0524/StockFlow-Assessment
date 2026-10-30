import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export function signToken(userId, orgId) {
  return jwt.sign({ userId, orgId }, JWT_SECRET, { expiresIn: '24h' })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token

  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    req.session = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}