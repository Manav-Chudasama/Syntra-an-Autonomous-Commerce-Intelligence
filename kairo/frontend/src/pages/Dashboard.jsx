// pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';

const StatCard = ({ label, value, sub }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    padding: '20px 24px',
    display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <span style={{ fontSize: 11, fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </span>
    <span style={{ fontSize: 28, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.04em', lineHeight: 1 }}>
      {value}
    </span>
    {sub && <span style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>{sub}</span>}
  </div>
);

const Toast = ({ toast }) => {
  if (!toast) return null;
  const bg = { success: '#0a0a0a', error: '#dc2626', info: '#2563eb' };
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bg[toast.type] || bg.info, color: '#fff',
      padding: '10px 16px', borderRadius: 8,
      fontSize: 13, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      animation: 'slideUp 0.2s ease', maxWidth: 360,
    }}>
      {toast.message}
    </div>
  );
};

const Dashboard = ({ onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const backgroundFetch = useCallback(async () => {
    try {
      const [productsData, pricingData, reorderData] = await Promise.all([
        api.getProducts(),
        api.getPendingPricingSuggestions(),
        api.getPendingReorderSuggestions(),
      ]);
      setProducts(productsData);
      setPricingSuggestions(pricingData);
      setReorderSuggestions(reorderData);
    } catch (err) { console.error(err); }
  }, []);

  const initialFetch = useCallback(async () => {
    try { setInitialLoading(true); await backgroundFetch(); }
    finally { setInitialLoading(false); }
  }, [backgroundFetch]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await backgroundFetch();
    setRefreshing(false);
    showToast('Data refreshed', 'success');
  };

  useEffect(() => {
    initialFetch();
    const interval = setInterval(backgroundFetch, 30000);
    return () => clearInterval(interval);
  }, [initialFetch, backgroundFetch]);

  const handleSimulateOrder = async (productId, quantity) => {
    try {
      await api.simulateOrder(productId, quantity);
      await backgroundFetch();
      showToast(`Sold ${quantity} unit(s) — scanning for suggestions…`, 'info');
      setTimeout(async () => { await backgroundFetch(); showToast('Dashboard synced', 'success'); }, 1500);
    } catch { showToast('Order failed', 'error'); }
  };

  const handleReceiveInventory = async (productId, quantity) => {
    try {
      await api.receiveInventory(productId, quantity);
      await backgroundFetch();
      showToast(`+${quantity} units added`, 'success');
    } catch { showToast('Failed', 'error'); }
  };

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '2px solid #e5e5e5', borderTopColor: '#0a0a0a',
          animation: 'spin 0.7s linear infinite',
        }} />
        <span style={{ fontSize: 13, color: '#737373' }}>Loading dashboard…</span>
      </div>
    );
  }

  const lowStockCount = products.filter(p => p.stockLevel <= p.reorderThreshold).length;
  const pendingCount = pricingSuggestions.length + reorderSuggestions.length;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .prod-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .stat-grid  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 1100px) { .prod-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 680px)  { .prod-grid { grid-template-columns: 1fr; } }
        @media (max-width: 900px)  { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <Toast toast={toast} />

      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.03em', margin: 0 }}>
              Commerce Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
              Real-time inventory &amp; AI-powered pricing intelligence
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff', border: '1px solid #e5e5e5', borderRadius: 6,
              padding: '6px 12px', fontSize: 12, color: '#737373', fontWeight: 500,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#16a34a',
                boxShadow: '0 0 0 2px rgba(22,163,74,0.2)', display: 'inline-block',
              }} />
              Live
            </div>
            <button type="button" onClick={handleManualRefresh} disabled={refreshing} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: 6,
              padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.7 : 1, fontFamily: 'Inter',
            }}>
              {refreshing && (
                <span style={{
                  width: 12, height: 12, borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <StatCard label="Total Products" value={products.length} sub="in catalog" />
        <StatCard label="Low Stock" value={lowStockCount} sub={lowStockCount > 0 ? 'needs attention' : 'all healthy'} />
        <StatCard label="Pricing Suggestions" value={pricingSuggestions.length} sub="pending review" />
        <StatCard label="Reorder Suggestions" value={reorderSuggestions.length} sub="pending review" />
      </div>

      {/* Pending AI suggestions CTA banner */}
      {pendingCount > 0 && (
        <div style={{
          background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 8,
          padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#2563eb',
              boxShadow: '0 0 0 3px rgba(37,99,235,0.15)', flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#0a0a0a' }}>
              <strong>{pendingCount}</strong> AI suggestion{pendingCount !== 1 ? 's' : ''} ready for review
            </span>
          </div>
          <button type="button" onClick={() => onNavigate('suggestions')} style={{
            cursor: 'pointer', border: '1px solid #0a0a0a', borderRadius: 6,
            background: '#0a0a0a', color: '#fff',
            padding: '5px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'Inter',
          }}>
            View Suggestions →
          </button>
        </div>
      )}

      <div style={{ borderTop: '1px solid #e5e5e5', marginBottom: 24 }} />

      {/* Products Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0a0a0a', margin: 0 }}>Products</h2>
        <span style={{ fontSize: 12, color: '#a3a3a3' }}>{products.length} items</span>
      </div>
      <div className="prod-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSimulateOrder={handleSimulateOrder}
            onReceiveInventory={handleReceiveInventory}
          />
        ))}
      </div>
    </>
  );
};

export default Dashboard;