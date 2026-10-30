import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

export default function DeleteModal({ isOpen, onClose, onConfirm, product }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(false)
      setError('')
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !loading) onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen || !product) return null

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await onConfirm()
    } catch (err) {
      setError(err.message || 'Failed to delete product. Please try again.')
      setLoading(false)
    }
  }

  // Use React Portal to render the modal directly into the body tag
  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={() => !loading && onClose()}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)',
          animation: 'scaleUp 0.2s ease-out',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '50%', 
            background: 'var(--danger-bg)', color: 'var(--danger-text)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600, color: 'var(--text-main)' }}>Delete Product?</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Are you sure you want to delete this product?
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Info */}
        <div style={{ margin: '0 24px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '15px', marginBottom: '4px' }}>{product.name}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>SKU: {product.sku}</div>
        </div>

        <p style={{ margin: '12px 24px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          This action cannot be undone.
        </p>

        {error && (
          <div style={{ margin: '16px 24px 0', padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '8px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Footer Buttons */}
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: '10px 20px' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={loading}
            className="btn"
            style={{ background: 'var(--danger-text)', color: 'white', padding: '10px 20px' }}
          >
            {loading ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>,
    document.body // Renders directly inside <body>
  )
}