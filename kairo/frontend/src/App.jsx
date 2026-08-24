import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import SuggestionsPage from './pages/SuggestionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './index.css';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard' },
  { id: 'products',    label: 'Products' },
  { id: 'suggestions', label: 'Suggestions' },
  { id: 'analytics',   label: 'Analytics' },
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <Dashboard onNavigate={setActivePage} />;
      case 'products':    return <ProductsPage />;
      case 'suggestions': return <SuggestionsPage />;
      case 'analytics':   return <AnalyticsPage />;
      default:            return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e5e5',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, background: '#0a0a0a',
              borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>K</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              Kairo
            </span>
            <span style={{
              background: '#f5f5f5', border: '1px solid #e5e5e5',
              borderRadius: 4, padding: '1px 8px',
              fontSize: 10, fontWeight: 600, color: '#737373', letterSpacing: '0.02em',
            }}>
              Commerce Intelligence
            </span>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_ITEMS.map(item => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  style={{
                    background: isActive ? '#f5f5f5' : 'transparent',
                    border: isActive ? '1px solid #e5e5e5' : '1px solid transparent',
                    cursor: 'pointer',
                    padding: '5px 14px', borderRadius: 6,
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0a0a0a' : '#737373',
                    fontFamily: 'Inter',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#0a0a0a'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#737373'; }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right side — user pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f5f5f5', border: '1px solid #e5e5e5',
            borderRadius: 99, padding: '4px 12px 4px 6px',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>U</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#525252' }}>Admin</span>
          </div>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────────────── */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
