import { Link } from 'react-router-dom'
import { LayoutGrid, Box, BarChart2, ShieldAlert, Shield, CheckCircle, Database } from 'lucide-react'

export default function Landing() {
  return (
    <div className="landing-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Navbar with proper spacing */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div style={{ background: 'var(--brand-teal)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <LayoutGrid size={20} color="white" />
          </div>
          StockFlow
        </div>
        
        {/* Buttons with a clean 32px gap */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none', fontSize: '15px' }}>
            Sign In
          </Link>
          <Link to="/signup" className="btn btn-teal" style={{ padding: '10px 24px' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="landing-hero">
        <div style={{ 
          display: 'inline-block', 
          background: 'var(--brand-teal-light)', 
          color: 'var(--brand-teal)', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: 600, 
          marginBottom: '24px' 
        }}>
          ✨ Manage Inventory. Stay in Control.
        </div>
        
        <h1>Your Stock. <br/><span>Your Control. Your Growth.</span></h1>
        <p>Track products, monitor available stock, and manage your inventory effortlessly with StockFlow.</p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/signup" className="btn btn-teal" style={{ padding: '14px 28px', fontSize: '16px' }}>
            Get Started
          </Link>
          <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
            View Features
          </a>
        </div>
      </div>

      {/* Feature Cards */}
      <div id="features" style={{ flex: 1 }}>
        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon"><Box size={28} /></div>
            <h3>Product Management</h3>
            <p>Add, update, view and manage all your products in one place.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><BarChart2 size={28} /></div>
            <h3>Stock Tracking</h3>
            <p>Keep track of product quantities and current inventory levels.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><ShieldAlert size={28} /></div>
            <h3>Low Stock Alerts</h3>
            <p>Identify products running low based on your stock thresholds.</p>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '40px', 
        color: 'var(--text-muted)', 
        paddingBottom: '40px', 
        fontSize: '14px', 
        fontWeight: 500 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> Product Management
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} /> Organization-wise Inventory
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} /> Stock Level Monitoring
        </div>
      </div>

    </div>
  )
}