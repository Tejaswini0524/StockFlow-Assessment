import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { ArrowLeft, Save, Trash2, CheckCircle2 } from 'lucide-react'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  
  const [form, setForm] = useState({
    name: '', sku: '', description: '', quantityOnHand: 0,
    costPrice: '', sellingPrice: '', lowStockThreshold: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (editing) {
      api(`/products/${id}`).then(p => setForm({
        name: p.name, sku: p.sku, description: p.description || '',
        quantityOnHand: p.quantityOnHand,
        costPrice: p.costPrice ?? '', sellingPrice: p.sellingPrice ?? '',
        lowStockThreshold: p.lowStockThreshold ?? '',
      }))
    }
  }, [id, editing])

  async function submit(e) {
    e.preventDefault()
    setError('')
    
    // Frontend validation just in case
    if (form.quantityOnHand === '') {
      return setError('Quantity on Hand is required.')
    }

    setLoading(true)
    try {
      const method = editing ? 'PATCH' : 'POST'
      const path = editing ? `/products/${id}` : '/products'
      await api(path, { method, body: JSON.stringify(form) })
      
      setSuccess(true)
      
      // Delay navigation slightly so the user sees the success message
      setTimeout(() => {
        navigate('/products')
      }, 800)
      
    } catch (err) { 
      setError(err.message) 
      setLoading(false)
    }
  }

  async function remove() {
    if (!confirm('Delete this product permanently?')) return
    await api(`/products/${id}`, { method: 'DELETE' })
    navigate('/products')
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      <div className="panel" style={{ maxWidth: '800px', padding: '40px' }}>
        <h1 style={{ marginBottom: '8px' }}>{editing ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="subtitle" style={{ marginBottom: '32px' }}>Enter the details for your product below.</p>
        
        {error && <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}
        {success && <div style={{ padding: '12px', background: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> Product saved successfully!</div>}
        
        <form onSubmit={submit}>
          {/* Product Name */}
          <div className="form-group">
            <label>Product Name *</label>
            <input required placeholder="e.g. Wireless Mouse" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          
          {/* SKU & Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label>SKU *</label>
              <input required placeholder="e.g. WM-001" value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>A unique code used to identify each product.</span>
            </div>
            <div className="form-group">
              <label>Quantity on Hand *</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                required 
                placeholder="0"
                value={form.quantityOnHand}
                onChange={e => setForm({ ...form, quantityOnHand: e.target.value })} 
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description (Optional)</label>
            <input placeholder="Product details..." value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Prices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label>Cost Price (₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '15px' }}>₹</span>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={form.costPrice}
                  style={{ paddingLeft: '36px' }}
                  onChange={e => setForm({ ...form, costPrice: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Selling Price (₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '15px' }}>₹</span>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={form.sellingPrice}
                  style={{ paddingLeft: '36px' }}
                  onChange={e => setForm({ ...form, sellingPrice: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Low Stock Threshold */}
          <div className="form-group">
            <label>Low Stock Threshold (Optional)</label>
            <input type="number" min="0" step="1" placeholder="Leave blank to use global default" value={form.lowStockThreshold}
              onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            {editing && (
              <button type="button" className="btn btn-secondary" style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-bg)', marginRight: 'auto' }} onClick={remove}>
                <Trash2 size={16} /> Delete
              </button>
            )}
            <Link to="/products" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-teal" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}