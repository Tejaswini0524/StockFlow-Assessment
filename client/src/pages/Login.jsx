import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import { LayoutGrid, Box, BarChart2, ShieldAlert } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) })
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } catch (err) { 
      setError(err.message) 
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      {/* Left Side (Teal) */}
      <div className="auth-side">
        <div className="auth-side-content">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="landing-logo" style={{ marginBottom: '40px' }}>
              <div style={{ background: 'var(--brand-teal)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <LayoutGrid size={24} color="white" />
              </div>
              <span style={{ color: 'var(--brand-teal)', fontSize: '24px', fontWeight: 800 }}>StockFlow</span>
            </div>
          </Link>
          
          <h2>Take control of your inventory like never before</h2>
          <p>Join businesses who trust StockFlow to manage their inventory efficiently and grow their operations.</p>
          
          <div className="auth-bullets">
            <div className="auth-bullet"><div className="auth-bullet-icon"><Box size={16} /></div> Product Management</div>
            <div className="auth-bullet"><div className="auth-bullet-icon"><BarChart2 size={16} /></div> Stock Tracking</div>
            <div className="auth-bullet"><div className="auth-bullet-icon"><ShieldAlert size={16} /></div> Low Stock Alerts</div>
          </div>
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <Link to="/signup" style={{ color: 'var(--brand-teal)', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
          </div>
          
          {error && <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
          
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-teal" style={{ width: '100%', padding: '14px', fontSize: '16px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}