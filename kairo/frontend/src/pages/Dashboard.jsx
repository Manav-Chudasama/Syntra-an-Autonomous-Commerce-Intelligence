// pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import SuggestionCard from '../components/SuggestionCard';
import { api } from '../services/api';

// ── tiny inline helpers ──────────────────────────────────────────────────────

const StatCard = ({ label, value, sub }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    padding: '20px 24px',
    display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <span style={{ fontSize: 12, fontWeight: 500, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </span>
    <span style={{ fontSize: 28, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.04em', lineHeight: 1 }}>
      {value}
    </span>
    {sub && <span style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>{sub}</span>}
  </div>
);

const SectionHeader = ({ title, badge, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0a0a0a', margin: 0 }}>{title}</h2>
      {badge !== undefined && (
        <span style={{
          background: '#0a0a0a', color: '#fff',
          borderRadius: 99, padding: '1px 8px',
          fontSize: 11, fontWeight: 600,
          minWidth: 20, textAlign: 'center',
        }}>
          {badge}
        </span>
      )}
    </div>
    {action}
  </div>
);

const Toast = ({ toast }) => {
  if (!toast) return null;
  const styles = {
    success: { bg: '#0a0a0a', icon: '✓' },
    error:   { bg: '#dc2626', icon: '✕' },
    info:    { bg: '#2563eb', icon: 'ℹ' },
  };
  const s = styles[toast.type] || styles.info;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: s.bg, color: '#fff',
      padding: '10px 16px', borderRadius: 8,
      fontSize: 13, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      animation: 'slideUp 0.2s ease',
      maxWidth: 360,
    }}>
      <span style={{
        width: 18, height: 18,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, flexShrink: 0,
      }}>
        {s.icon}
      </span>
      {toast.message}
    </div>
  );
};

// ── Dashboard component ──────────────────────────────────────────────────────

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
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
      setError(null);
    } catch (err) {
      console.error('Background refresh failed:', err);
    }
  }, []);

  const initialFetch = useCallback(async () => {
    try {
      setInitialLoading(true);
      await backgroundFetch();
    } finally {
      setInitialLoading(false);
    }
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
      setTimeout(async () => {
        await backgroundFetch();
        showToast('Dashboard synced', 'success');
      }, 1500);
    } catch (err) {
      console.error('Failed to simulate order', err);
      showToast('Order failed', 'error');
    }
  };

  const handleReceiveInventory = async (productId, quantity) => {
    try {
      await api.receiveInventory(productId, quantity);
      await backgroundFetch();
      showToast(`+${quantity} units added to stock`, 'success');
    } catch (err) {
      showToast('Failed to receive inventory', 'error');
    }
  };

  const handleAcceptPricingSuggestion = async (id) => {
    try {
      await api.acceptPricingSuggestion(id);
      await backgroundFetch();
      showToast('Price updated', 'success');
    } catch (err) { showToast('Failed', 'error'); }
  };

  const handleRejectPricingSuggestion = async (id) => {
    try {
      await api.rejectPricingSuggestion(id);
      await backgroundFetch();
      showToast('Suggestion dismissed', 'info');
    } catch (err) { showToast('Failed', 'error'); }
  };

  const handleAcceptReorderSuggestion = async (id) => {
    try {
      await api.acceptReorderSuggestion(id);
      await backgroundFetch();
      showToast('Reorder placed', 'success');
    } catch (err) { showToast('Failed', 'error'); }
  };

  const handleRejectReorderSuggestion = async (id) => {
    try {
      await api.rejectReorderSuggestion(id);
      await backgroundFetch();
      showToast('Suggestion dismissed', 'info');
    } catch (err) { showToast('Failed', 'error'); }
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

  if (error) {
    return (
      <div style={{
        background: '#fef2f2', border: '1px solid #fecaca',
        borderRadius: 8, padding: '16px 20px', color: '#dc2626',
        fontSize: 14,
      }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  const lowStockCount = products.filter(p => p.stockLevel <= p.reorderThreshold).length;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .suggestion-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 1100px) { .product-grid, .suggestion-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 680px)  { .product-grid, .suggestion-grid { grid-template-columns: 1fr; } }
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 900px)  { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px)  { .stat-grid { grid-template-columns: 1fr; } }
      `}</style>

      <Toast toast={toast} />

      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.04em', margin: 0 }}>
              Commerce Dashboard
            </h1>
            <p style={{ fontSize: 14, color: '#737373', marginTop: 4 }}>
              Real-time inventory & AI-powered pricing intelligence
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff', border: '1px solid #e5e5e5', borderRadius: 6,
              padding: '6px 12px', fontSize: 12, color: '#737373', fontWeight: 500,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#16a34a',
                boxShadow: '0 0 0 2px rgba(22,163,74,0.2)',
                display: 'inline-block',
              }} />
              Live
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#0a0a0a', color: '#fff',
                border: 'none', borderRadius: 6,
                padding: '7px 14px', fontSize: 13, fontWeight: 500,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                opacity: refreshing ? 0.7 : 1,
                fontFamily: 'Inter',
              }}
            >
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

      {/* Stats Row */}
      <div className="stat-grid" style={{ marginBottom: 32 }}>
        <StatCard label="Total Products" value={products.length} sub="in catalog" />
        <StatCard
          label="Low Stock"
          value={lowStockCount}
          sub={lowStockCount > 0 ? 'needs attention' : 'all healthy'}
        />
        <StatCard label="Pricing Suggestions" value={pricingSuggestions.length} sub="pending review" />
        <StatCard label="Reorder Suggestions" value={reorderSuggestions.length} sub="pending review" />
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #e5e5e5', marginBottom: 32 }} />

      {/* Products Section */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader title="Products" />
        <div className="product-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSimulateOrder={handleSimulateOrder}
              onReceiveInventory={handleReceiveInventory}
            />
          ))}
        </div>
      </section>

      {/* AI Suggestions */}
      {(pricingSuggestions.length > 0 || reorderSuggestions.length > 0) && (
        <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 32 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: '#737373',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#2563eb',
                boxShadow: '0 0 0 2px rgba(37,99,235,0.2)',
              }} />
              AI Recommendations
            </span>
          </div>
        </div>
      )}

      {/* Pricing Suggestions */}
      {pricingSuggestions.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeader title="Pricing Suggestions" badge={pricingSuggestions.length} />
          <div className="suggestion-grid">
            {pricingSuggestions.map(suggestion => {
              const product = products.find(p => p.id === suggestion.productId);
              return (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  product={product}
                  type="pricing"
                  onAccept={handleAcceptPricingSuggestion}
                  onReject={handleRejectPricingSuggestion}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Reorder Suggestions */}
      {reorderSuggestions.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeader title="Reorder Suggestions" badge={reorderSuggestions.length} />
          <div className="suggestion-grid">
            {reorderSuggestions.map(suggestion => {
              const product = products.find(p => p.id === suggestion.productId);
              return (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  product={product}
                  type="reorder"
                  onAccept={handleAcceptReorderSuggestion}
                  onReject={handleRejectReorderSuggestion}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {pricingSuggestions.length === 0 && reorderSuggestions.length === 0 && (
        <div style={{
          border: '1px dashed #d4d4d4', borderRadius: 8,
          padding: '40px 24px', textAlign: 'center',
          background: '#fafafa',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>◈</div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#0a0a0a' }}>No pending suggestions</p>
          <p style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
            Sell units on low-stock products to trigger the AI engine
          </p>
        </div>
      )}
    </>
  );
};

export default Dashboard;