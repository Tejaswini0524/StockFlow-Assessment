import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import { LayoutGrid, Box, BarChart2, ShieldAlert } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '', orgName: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
    if (!passwordRegex.test(form.password)) {
      return setError('Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.')
    }
    if (form.password !== form.confirm) return setError('Passwords do not match')
    
    setLoading(true)
    try {
      const { token } = await api('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(form),
      })
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
          
          <h2>Start managing your inventory today</h2>
          <p>Create an account and get instant access to all the tools you need to track your stock and grow.</p>
          
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
            <h1>Create account</h1>
            <Link to="/login" style={{ color: 'var(--brand-teal)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Start your inventory management journey</p>
          
          {error && <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
          
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>First Name</label>
                <input placeholder="John" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input placeholder="Doe" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input placeholder="e.g. My Test Store" required value={form.orgName} onChange={e => setForm({ ...form, orgName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@company.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Confirm</label>
                <input type="password" placeholder="••••••••" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-teal" style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}