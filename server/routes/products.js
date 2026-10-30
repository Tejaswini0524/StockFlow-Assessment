
import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

const toProduct = (row) => row && ({
  id: row.id,
  organizationId: row.organization_id,
  name: row.name,
  sku: row.sku,
  description: row.description,
  quantityOnHand: row.quantity_on_hand,
  costPrice: row.cost_price,
  sellingPrice: row.selling_price,
  lowStockThreshold: row.low_stock_threshold,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM products WHERE organization_id = $1 ORDER BY created_at DESC',
      [req.session.orgId]
    )
    res.json(result.rows.map(toProduct))
  } catch (e) {
    next(e)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM products WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.session.orgId]
    )

    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(toProduct(result.rows[0]))
  } catch (e) {
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const {
      name, sku, description, quantityOnHand,
      costPrice, sellingPrice, lowStockThreshold
    } = req.body

    if (!name || !sku) {
      return res.status(400).json({ error: 'Name and SKU are required.' })
    }

    if (quantityOnHand === '' || quantityOnHand == null) {
      return res.status(400).json({ error: 'Quantity on Hand is required.' })
    }

    const quantity = Number(quantityOnHand)

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        error: 'Quantity on Hand must be a non-negative whole number.'
      })
    }

    const id = randomUUID()

    const result = await db.query(`
      INSERT INTO products (
        id, organization_id, name, sku, description,
        quantity_on_hand, cost_price, selling_price, low_stock_threshold
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      id,
      req.session.orgId,
      name,
      sku,
      description || null,
      quantity,
      costPrice === '' || costPrice == null ? null : Number(costPrice),
      sellingPrice === '' || sellingPrice == null ? null : Number(sellingPrice),
      lowStockThreshold === '' || lowStockThreshold == null ? null : Number(lowStockThreshold)
    ])

    res.json(toProduct(result.rows[0]))
  } catch (e) {
    if (e.code === '23505') {
      return res.status(400).json({
        error: 'SKU already exists in your organization.'
      })
    }
    next(e)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const {
      name, sku, description, quantityOnHand,
      costPrice, sellingPrice, lowStockThreshold
    } = req.body

    if (!name || !sku) {
      return res.status(400).json({ error: 'Name and SKU are required.' })
    }

    if (quantityOnHand === '' || quantityOnHand == null) {
      return res.status(400).json({ error: 'Quantity on Hand is required.' })
    }

    const quantity = Number(quantityOnHand)

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        error: 'Quantity on Hand must be a non-negative whole number.'
      })
    }

    const result = await db.query(`
      UPDATE products SET
        name = $1,
        sku = $2,
        description = $3,
        quantity_on_hand = $4,
        cost_price = $5,
        selling_price = $6,
        low_stock_threshold = $7,
        updated_at = NOW()
      WHERE id = $8 AND organization_id = $9
      RETURNING *
    `, [
      name,
      sku,
      description || null,
      quantity,
      costPrice === '' || costPrice == null ? null : Number(costPrice),
      sellingPrice === '' || sellingPrice == null ? null : Number(sellingPrice),
      lowStockThreshold === '' || lowStockThreshold == null ? null : Number(lowStockThreshold),
      req.params.id,
      req.session.orgId
    ])

    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' })

    res.json(toProduct(result.rows[0]))
  } catch (e) {
    if (e.code === '23505') {
      return res.status(400).json({
        error: 'SKU already exists in your organization.'
      })
    }
    next(e)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM products WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.session.orgId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not found' })
    }

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

export default router
