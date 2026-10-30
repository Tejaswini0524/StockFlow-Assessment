import { useEffect, useState } from 'react'
import { api } from '../api'
import { Save, CheckCircle2, Package } from 'lucide-react'

export default function Settings() {
  const [threshold, setThreshold] = useState('5')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/settings')
      .then(d => setThreshold(String(d.defaultLowStockThreshold)))
      .catch(e => setError(e.message))
  }, [])

  async function submit(e) {
    e.preventDefault()
    setError('')

    // Validation: Ensure it's a non-negative integer
    const parsed = Number(threshold)
    if (threshold === '' || !Number.isInteger(parsed) || parsed < 0) {
      return setError('Please enter a valid non-negative whole number.')
    }

    setLoading(true)
    try {
      await api('/settings', {
        method: 'PATCH',
        body: JSON.stringify({ defaultLowStockThreshold: parsed }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--brand-teal)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Inventory Preferences</p>
        <h1>Inventory Settings</h1>
        <p className="subtitle" style={{ margin: 0 }}>Configure default stock preferences for your organization.</p>
      </div>

      {error && <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', maxWidth: '600px' }}>{error}</div>}

      <div className="panel" style={{ maxWidth: '600px', padding: '32px' }}>
        
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          <div className="card-icon teal" style={{ width: '48px', height: '48px' }}>
            <Package size={24} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '18px', fontWeight: 600 }}>Default Stock Configuration</h3>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '14px' }}>Set your inventory alert preferences.</p>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Default Low Stock Threshold</label>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 12px', lineHeight: 1.5 }}>
              Products without a custom threshold will use this value to determine when stock is running low.
            </p>
            
            {/* Clean Input */}
            <div style={{ maxWidth: '200px' }}>
              <input 
                type="number" 
                min="0"
                step="1"
                value={threshold}
                onChange={e => setThreshold(e.target.value)} 
              />
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '8px 0 0' }}>
              Products with a custom threshold will use their individual setting.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <button type="submit" className="btn btn-teal" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && (
              <span style={{ color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, animation: 'fade-in-up 0.3s ease-out' }}>
                <CheckCircle2 size={16} /> Inventory settings updated successfully.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}