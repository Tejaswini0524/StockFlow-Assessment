import { useEffect, useState } from 'react'
import { api } from '../api'
import { Package, Boxes, AlertCircle, ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api('/dashboard').then(setData)
  }, [])

  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  const isEmpty = data.totalProducts === 0

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <p style={{ color: 'var(--brand-teal)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Inventory Overview</p>
          <h1 style={{ marginBottom: '8px' }}>Inventory Dashboard</h1>
          <p className="subtitle" style={{ margin: 0 }}>Monitor your products, stock levels, and low-stock items in one place.</p>
        </div>
        <Link to="/products/new" className="btn btn-teal">
          <Plus size={18} /> Add Product
        </Link>
      </div>
      
      <div className="cards-grid">
        <div className="stat-card">
          <div className="card-header">
            <div className="card-icon teal"><Package size={22} /></div>
          </div>
          <div>
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{data.totalProducts}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="card-header">
            <div className="card-icon teal"><Boxes size={22} /></div>
          </div>
          <div>
            <div className="stat-label">Total Stock Units</div>
            <div className="stat-value">{data.totalQuantity}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <div className="card-icon orange"><AlertCircle size={22} /></div>
          </div>
          <div>
            <div className="stat-label">Low Stock Products</div>
            <div className="stat-value" style={{ color: 'var(--warning-text)' }}>{data.lowStockItems.length}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '18px' }}>Low Stock Alerts</h2>
          {!isEmpty && (
            <Link to="/products" style={{ color: 'var(--brand-teal)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              View All Products <ArrowRight size={16} />
            </Link>
          )}
        </div>
        
        {isEmpty ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <Package size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-main)' }}>No products yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Your inventory is empty. Start by adding your first product to track stock levels.</p>
            <Link to="/products/new" className="btn btn-teal">
              <Plus size={16} /> Add your first product
            </Link>
          </div>
        ) : data.lowStockItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            All products are sufficiently stocked. Great job!
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Quantity on Hand</th>
                <th>Low Stock Threshold</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockItems.map((p, index) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand-teal-light)', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                        {index + 1}
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.sku}</td>
                  <td style={{ fontWeight: 600, color: p.quantityOnHand === 0 ? 'var(--danger-text)' : 'var(--warning-text)' }}>
                    {p.quantityOnHand}
                  </td>
                  <td>{p.lowStockThreshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}