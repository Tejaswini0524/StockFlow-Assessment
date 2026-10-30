
import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT default_low_stock_threshold FROM organizations WHERE id = $1',
      [req.session.orgId]
    )

    res.json({
      defaultLowStockThreshold:
        result.rows[0]?.default_low_stock_threshold ?? 5
    })
  } catch (e) {
    next(e)
  }
})

router.patch('/', async (req, res, next) => {
  try {
    const threshold = Number(req.body.defaultLowStockThreshold)

    if (!Number.isInteger(threshold) || threshold < 0) {
      return res.status(400).json({
        error: 'Default stock threshold must be a non-negative whole number.'
      })
    }

    const result = await db.query(
      `UPDATE organizations
       SET default_low_stock_threshold = $1
       WHERE id = $2`,
      [threshold, req.session.orgId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

export default router
