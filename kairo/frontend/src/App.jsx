import Dashboard from './pages/Dashboard'
import './index.css'

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Top Navigation Bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e5e5',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 24px',
          height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo / Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28,
              background: '#0a0a0a',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Inter' }}>K</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              Kairo
            </span>
            <span style={{
              background: '#f5f5f5', border: '1px solid #e5e5e5',
              borderRadius: 4, padding: '1px 8px',
              fontSize: 11, fontWeight: 500, color: '#737373',
              letterSpacing: '0.02em',
            }}>
              Commerce Intelligence
            </span>
          </div>
          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {['Dashboard', 'Products', 'Suggestions', 'Analytics'].map((item, i) => (
              <button key={item} style={{
                background: i === 0 ? '#f5f5f5' : 'transparent',
                border: 'none', cursor: 'pointer',
                padding: '5px 12px', borderRadius: 6,
                fontSize: 13, fontWeight: 500,
                color: i === 0 ? '#0a0a0a' : '#737373',
                fontFamily: 'Inter',
              }}>
                {item}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
        <Dashboard />
      </main>
    </div>
  )
}

export default App
