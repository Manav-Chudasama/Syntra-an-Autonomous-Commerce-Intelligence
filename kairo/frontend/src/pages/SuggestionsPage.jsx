// pages/SuggestionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SuggestionCard from '../components/SuggestionCard';
import { api } from '../services/api';

const SuggestionsPage = () => {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pricing' | 'reorder'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    try {
      const [prods, pricing, reorder] = await Promise.all([
        api.getProducts(),
        api.getPendingPricingSuggestions(),
        api.getPendingReorderSuggestions(),
      ]);
      setProducts(prods);
      setPricingSuggestions(pricing);
      setReorderSuggestions(reorder);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
    showToast('Refreshed');
  };

  const handleAcceptPricing = async (id) => {
    await api.acceptPricingSuggestion(id);
    await fetchAll();
    showToast('Price updated on product');
  };
  const handleRejectPricing = async (id) => {
    await api.rejectPricingSuggestion(id);
    await fetchAll();
    showToast('Suggestion dismissed', 'info');
  };
  const handleAcceptReorder = async (id) => {
    await api.acceptReorderSuggestion(id);
    await fetchAll();
    showToast('Reorder placed — stock updated!');
  };
  const handleRejectReorder = async (id) => {
    await api.rejectReorderSuggestion(id);
    await fetchAll();
    showToast('Suggestion dismissed', 'info');
  };

  const totalPending = pricingSuggestions.length + reorderSuggestions.length;

  const Tab = ({ id, label, count }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 6,
        background: activeTab === id ? '#0a0a0a' : 'transparent',
        color: activeTab === id ? '#fff' : '#737373',
        border: activeTab === id ? '1px solid #0a0a0a' : '1px solid transparent',
        cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'Inter',
        transition: 'all 0.12s',
      }}
    >
      {label}
      {count > 0 && (
        <span style={{
          background: activeTab === id ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
          color: activeTab === id ? '#fff' : '#525252',
          borderRadius: 99, padding: '0 6px',
          fontSize: 11, fontWeight: 700, minWidth: 18, textAlign: 'center',
        }}>
          {count}
        </span>
      )}
    </button>
  );

  const SectionGrid = ({ suggestions, type, onAccept, onReject, empty }) => {
    if (suggestions.length === 0) {
      return (
        <div style={{
          border: '1px dashed #d4d4d4', borderRadius: 8,
          padding: '40px 24px', textAlign: 'center', background: '#fafafa',
        }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#0a0a0a', margin: 0 }}>{empty}</p>
          <p style={{ fontSize: 12, color: '#737373', marginTop: 4 }}>Sell units on low-stock products to trigger the AI engine</p>
        </div>
      );
    }
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}>
        {suggestions.map(s => {
          const product = products.find(p => p.id === s.productId);
          return (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              product={product}
              type={type}
              onAccept={onAccept}
              onReject={onReject}
            />
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '2px solid #e5e5e5', borderTopColor: '#0a0a0a',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'info' ? '#2563eb' : '#0a0a0a',
          color: '#fff', padding: '10px 16px', borderRadius: 8,
          fontSize: 13, fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>{toast.message}</div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.03em', margin: 0 }}>
              AI Suggestions
            </h1>
            {totalPending > 0 && (
              <span style={{
                background: '#0a0a0a', color: '#fff',
                borderRadius: 99, padding: '2px 10px',
                fontSize: 12, fontWeight: 700,
              }}>{totalPending} pending</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#737373' }}>
            Review and act on AI-generated pricing and reorder recommendations
          </p>
        </div>
        <button type="button" onClick={handleRefresh} disabled={refreshing} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#fff', border: '1px solid #e5e5e5', borderRadius: 6,
          padding: '7px 14px', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', color: '#525252', fontFamily: 'Inter',
          opacity: refreshing ? 0.6 : 1,
        }}>
          {refreshing && (
            <span style={{
              width: 12, height: 12, borderRadius: '50%',
              border: '1.5px solid #e5e5e5', borderTopColor: '#0a0a0a',
              animation: 'spin 0.7s linear infinite', display: 'inline-block',
            }} />
          )}
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        borderBottom: '1px solid #e5e5e5', paddingBottom: 12,
      }}>
        <Tab id="all"     label="All"     count={totalPending} />
        <Tab id="pricing" label="Pricing" count={pricingSuggestions.length} />
        <Tab id="reorder" label="Reorder" count={reorderSuggestions.length} />
      </div>

      {/* Content */}
      {totalPending === 0 ? (
        <div style={{
          border: '1px dashed #d4d4d4', borderRadius: 8,
          padding: '60px 24px', textAlign: 'center', background: '#fafafa',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>◈</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0a0a0a' }}>No pending suggestions</p>
          <p style={{ fontSize: 13, color: '#737373', marginTop: 6, maxWidth: 320, margin: '6px auto 0' }}>
            Go to the Dashboard and sell units on low-stock products. The AI engine will generate recommendations automatically.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Pricing */}
          {(activeTab === 'all' || activeTab === 'pricing') && (
            <section>
              {activeTab === 'all' && pricingSuggestions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Pricing Suggestions</h2>
                  <span style={{
                    background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                    borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700,
                  }}>{pricingSuggestions.length}</span>
                </div>
              )}
              <SectionGrid
                suggestions={pricingSuggestions}
                type="pricing"
                onAccept={handleAcceptPricing}
                onReject={handleRejectPricing}
                empty="No pending pricing suggestions"
              />
            </section>
          )}

          {/* Reorder */}
          {(activeTab === 'all' || activeTab === 'reorder') && (
            <section>
              {activeTab === 'all' && reorderSuggestions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Reorder Suggestions</h2>
                  <span style={{
                    background: '#fafafa', color: '#525252', border: '1px solid #e5e5e5',
                    borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700,
                  }}>{reorderSuggestions.length}</span>
                </div>
              )}
              <SectionGrid
                suggestions={reorderSuggestions}
                type="reorder"
                onAccept={handleAcceptReorder}
                onReject={handleRejectReorder}
                empty="No pending reorder suggestions"
              />
            </section>
          )}
        </div>
      )}
    </>
  );
};

export default SuggestionsPage;
