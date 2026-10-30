import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useMemo } from 'react'
import { LayoutGrid, Package, Settings, LogOut, Search, Bell, Box, ChevronDown, X } from 'lucide-react'
import { api, getToken } from './api'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import SettingsPage from './pages/Settings'

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // User & Auth state
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Global Search State
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef(null)

  // Fetch User
  useEffect(() => {
    api('/auth/me').then(setUser).catch(() => { localStorage.removeItem('token'); navigate('/login'); })
  }, [navigate])

  // Fetch all products for global search & settings
  useEffect(() => {
    if (user) {
      api('/products').then(setProducts).catch(console.error)
    }
  }, [user])

  // Handle clicks outside of dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }) } catch {}
    localStorage.removeItem('token')
    navigate('/login')
  }

  // Global Search Filter Logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5) // Limit to 5 results for the dropdown
  }, [products, searchQuery])

  if (!user) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutGrid size={20} /> },
    { path: '/products', label: 'Products', icon: <Box size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon">
            <LayoutGrid size={20} color="white" />
          </div>
          StockFlow
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}>
              {item.icon} {item.label}
            </Link>
          ))}
          <button onClick={logout} className="sidebar-link sidebar-logout">
            <LogOut size={20} /> Logout
          </button>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-header">
          {/* === GLOBAL SEARCH BAR === */}
          <div className="header-search" ref={searchRef} style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              placeholder="Search products by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
              >
                <X size={16} />
              </button>
            )}

            {/* Search Results Dropdown */}
            {searchFocused && searchQuery.trim() !== '' && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                zIndex: 50,
                overflow: 'hidden',
                minWidth: '350px'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Search Results
                </div>
                
                {searchResults.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    No products found.
                  </div>
                ) : (
                  <div>
                    {searchResults.map(p => {
                      const threshold = p.lowStockThreshold ?? 5 // Simplified fallback
                      const out = p.quantityOnHand === 0
                      const low = p.quantityOnHand <= threshold && !out
                      
                      let badgeClass = 'in-stock'
                      let badgeText = 'In Stock'
                      if (out) { badgeClass = 'out-stock'; badgeText = 'Out of Stock' }
                      else if (low) { badgeClass = 'low-stock'; badgeText = 'Low Stock' }

                      return (
                        <div 
                          key={p.id}
                          onClick={() => {
                            navigate(`/products/${p.id}/edit`)
                            setSearchQuery('')
                            setSearchFocused(false)
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-body)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '14px' }}>{p.name}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SKU: {p.sku} · Qty: {p.quantityOnHand}</span>
                          </div>
                          <span className={`badge ${badgeClass}`} style={{ fontSize: '11px', padding: '4px 8px' }}>{badgeText}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                <div style={{ padding: '10px 16px', textAlign: 'center', background: 'var(--bg-body)', borderTop: '1px solid var(--border)' }}>
                  <Link 
                    to="/products" 
                    onClick={() => { setSearchQuery(''); setSearchFocused(false); }}
                    style={{ fontSize: '13px', color: 'var(--brand-teal)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    View all products
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="header-user" ref={dropdownRef} style={{ position: 'relative' }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '8px' }}>
              <Bell size={20} />
            </button>
            
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                transition: 'background 0.2s',
                background: dropdownOpen ? 'var(--bg-body)' : 'transparent'
              }}
            >
              <div className="avatar">
                {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', lineHeight: '1.2' }}>
                <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  {user.first_name ? `${user.first_name} ${user.last_name}` : 'User'}
                </strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                  {user.org_name || 'Organization'}
                </span>
              </div>
              <ChevronDown size={16} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
            </div>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                padding: '16px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>Email</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>{user.email}</div>
                </div>
                <div style={{ height: '1px', background: 'var(--border)' }}></div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>Organization</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>{user.org_name}</div>
                </div>
              </div>
            )}
          </div>
        </header>
        
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/*" element={
          <Protected>
            <AppLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          </Protected>
        } />
      </Routes>
    </BrowserRouter>
  )
}