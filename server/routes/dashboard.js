
import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const orgResult = await db.query(
      'SELECT default_low_stock_threshold FROM organizations WHERE id = $1',
      [req.session.orgId]
    )

    const defaultThreshold =
      orgResult.rows[0]?.default_low_stock_threshold ?? 5

    const productsResult = await db.query(
      'SELECT * FROM products WHERE organization_id = $1',
      [req.session.orgId]
    )

    const products = productsResult.rows
    const totalProducts = products.length

    const totalQuantity = products.reduce(
      (sum, product) => sum + product.quantity_on_hand,
      0
    )

    const lowStockItems = products
      .filter(product =>
        product.quantity_on_hand <=
        (product.low_stock_threshold ?? defaultThreshold)
      )
      .map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantityOnHand: product.quantity_on_hand,
        lowStockThreshold:
          product.low_stock_threshold ?? defaultThreshold
      }))

    res.json({ totalProducts, totalQuantity, lowStockItems })
  } catch (e) {
    next(e)
  }
})

export default router
