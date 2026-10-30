import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Plus, Search, Edit2, Trash2, Package, ArrowLeft, X, Filter } from 'lucide-react'
import DeleteModal from '../components/DeleteModal' // <-- Import the modal

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [defaultThreshold, setDefaultThreshold] = useState(5)
  const [loading, setLoading] = useState(true)
  
  // State for the delete modal
  const [productToDelete, setProductToDelete] = useState(null)

  async function load() {
    const [list, settings] = await Promise.all([api('/products'), api('/settings')])
    setProducts(list)
    setDefaultThreshold(settings.defaultLowStockThreshold)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Handles the actual deletion when confirmed in the modal
  async function confirmDelete() {
    if (!productToDelete) return
    await api(`/products/${productToDelete.id}`, { method: 'DELETE' })
    setProductToDelete(null) // Close the modal
    load() // Refresh the list
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setAppliedSearch(search)
    }
  }

  const handleSearchClick = () => {
    setAppliedSearch(search)
  }

  const clearFilters = () => {
    setSearch('')
    setAppliedSearch('')
    setStatusFilter('All')
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(appliedSearch.toLowerCase()) || 
        p.sku.toLowerCase().includes(appliedSearch.toLowerCase())
      
      const threshold = p.lowStockThreshold ?? defaultThreshold
      const isOutOfStock = p.quantityOnHand === 0
      const isLowStock = p.quantityOnHand <= threshold && !isOutOfStock
      const isInStock = p.quantityOnHand > threshold

      let matchesStatus = true
      if (statusFilter === 'In Stock') matchesStatus = isInStock
      else if (statusFilter === 'Low Stock') matchesStatus = isLowStock
      else if (statusFilter === 'Out of Stock') matchesStatus = isOutOfStock

      return matchesSearch && matchesStatus
    })
  }, [products, appliedSearch, statusFilter, defaultThreshold])

  const hasActiveFilters = appliedSearch !== '' || statusFilter !== 'All'
  const isDatabaseEmpty = products.length === 0

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Products</h1>
          <p className="subtitle" style={{ margin: 0 }}>Manage your inventory and product catalog</p>
        </div>
        <Link to="/products/new" className="btn btn-teal">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="panel">
        {!isDatabaseEmpty && (
          <div className="panel-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch', padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div 
                className="search-input-wrapper"
                style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 14px', height: '44px', width: '320px', transition: 'all 0.2s' }}
              >
                <button onClick={handleSearchClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                  <Search size={18} color="#94a3b8" />
                </button>
                <input 
                  placeholder="Search products by name or SKU..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 10px', outline: 'none', fontSize: '14px', height: '100%' }}
                />
                {search && (
                  <button onClick={() => { setSearch(''); setAppliedSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                    <X size={16} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 14px', height: '44px' }}>
                <Filter size={18} color="#94a3b8" style={{ marginRight: '8px' }} />
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ background: 'transparent', border: 'none', fontSize: '14px', fontWeight: 500, color: 'var(--text-main)', outline: 'none', cursor: 'pointer', width: '130px' }}
                >
                  <option value="All">Filter by Stock</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
                Showing <strong>{filteredProducts.length}</strong> products
              </div>
            </div>

            {hasActiveFilters && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button onClick={clearFilters} className="btn" style={{ background: 'transparent', color: 'var(--danger-text)', border: 'none', padding: '4px 8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <X size={14} /> Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>
        ) : isDatabaseEmpty ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <Package size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-main)' }}>No products yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't added any products to your inventory. Add your first product to get started.</p>
            <Link to="/products/new" className="btn btn-teal">
              <Plus size={16} /> Add Product
            </Link>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <Search size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-main)' }}>No products match your search or filters</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Try adjusting your search terms or clearing the filters.</p>
            <button onClick={clearFilters} className="btn btn-teal">Clear Filters</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Status</th>
                <th>Stock</th>
                <th>Price</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, index) => {
                const threshold = p.lowStockThreshold ?? defaultThreshold
                const out = p.quantityOnHand === 0
                const low = p.quantityOnHand <= threshold && !out
                
                let badgeClass = 'in-stock'
                let badgeText = 'In Stock'
                if (out) { badgeClass = 'out-stock'; badgeText = 'Out of Stock' }
                else if (low) { badgeClass = 'low-stock'; badgeText = 'Low Stock' }

                return (
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
                    <td><span className={`badge ${badgeClass}`}>{badgeText}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.quantityOnHand}</td>
                    <td>
  {p.sellingPrice != null
    ? `₹${Number(p.sellingPrice).toFixed(2)}`
    : '-'}
</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/products/${p.id}/edit`} className="btn-icon" style={{ marginRight: '8px', color: 'var(--text-muted)' }} title="Edit">
                        <Edit2 size={16} />
                      </Link>
                      {/* Trigger the modal instead of window.confirm */}
                      <button className="btn-icon" style={{ color: 'var(--danger-text)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setProductToDelete(p)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* The Custom Modal */}
      <DeleteModal 
        isOpen={!!productToDelete} 
        onClose={() => setProductToDelete(null)} 
        onConfirm={confirmDelete} 
        product={productToDelete} 
      />
    </div>
  )
}