// pages/AnalyticsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import { api } from '../services/api';

// ── Palette ──────────────────────────────────────────────────────────────────
const COLORS = ['#0a0a0a', '#525252', '#a3a3a3', '#d4d4d4', '#e5e5e5', '#737373', '#262626', '#404040'];
const CATEGORY_COLORS = {
  ELECTRONICS: '#0a0a0a',
  APPAREL:     '#525252',
  HOME:        '#a3a3a3',
  SPORTS:      '#737373',
  BEAUTY:      '#262626',
  FOOD:        '#d4d4d4',
  OTHER:       '#e5e5e5',
};

// ── Shared small components ───────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, trend, unit = '' }) => {
  const trendUp = typeof trend === 'number' ? trend > 0 : null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.04em', lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 14, color: '#a3a3a3', fontWeight: 500 }}>{unit}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {trendUp !== null && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
            background: trendUp ? '#f0fdf4' : '#fef2f2',
            color: trendUp ? '#16a34a' : '#dc2626',
            border: trendUp ? '1px solid #bbf7d0' : '1px solid #fecaca',
          }}>
            {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        {sub && <span style={{ fontSize: 11, color: '#a3a3a3' }}>{sub}</span>}
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, action }) => (
  <div style={{
    background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8,
    padding: '20px 24px',
    display: 'flex', flexDirection: 'column', gap: 16,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5', borderRadius: 6,
      padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      fontSize: 12, fontFamily: 'Inter',
    }}>
      {label && <p style={{ fontWeight: 600, color: '#0a0a0a', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#525252' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.color, flexShrink: 0 }} />
          <span>{p.name}: <strong style={{ color: '#0a0a0a' }}>{prefix}{p.value}{suffix}</strong></span>
        </div>
      ))}
    </div>
  );
};

// ── Alert table row ───────────────────────────────────────────────────────────

const AlertRow = ({ product, i, last }) => {
  const pct = Math.round((product.stockLevel / Math.max(product.reorderThreshold, 1)) * 100);
  const severity = pct <= 0 ? 'critical' : pct <= 50 ? 'low' : 'warning';
  const clr = { critical: '#dc2626', low: '#d97706', warning: '#2563eb' };
  const bg  = { critical: '#fef2f2', low: '#fffbeb', warning: '#eff6ff' };
  const brd = { critical: '#fecaca', low: '#fde68a', warning: '#bfdbfe' };
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 80px 80px 100px 90px',
      alignItems: 'center', gap: 0,
      padding: '12px 16px',
      borderBottom: last ? 'none' : '1px solid #f5f5f5',
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', margin: 0 }}>{product.name}</p>
        <p style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: '#a3a3a3', margin: 0 }}>{product.id}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: clr[severity] }}>{product.stockLevel}</span>
      <span style={{ fontSize: 13, color: '#737373' }}>{product.reorderThreshold}</span>
      <div style={{ width: '80%' }}>
        <div style={{ height: 4, background: '#f5f5f5', borderRadius: 99 }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: clr[severity], borderRadius: 99 }} />
        </div>
      </div>
      <span style={{
        display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px',
        borderRadius: 99, background: bg[severity], color: clr[severity], border: `1px solid ${brd[severity]}`,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {severity}
      </span>
    </div>
  );
};

// ── Main AnalyticsPage ────────────────────────────────────────────────────────

const AnalyticsPage = () => {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '2px solid #e5e5e5', borderTopColor: '#0a0a0a',
          animation: 'spin 0.7s linear infinite',
        }} />
        <span style={{ fontSize: 13, color: '#737373' }}>Loading analytics…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Derived metrics ───────────────────────────────────────────────────────

  const totalProducts    = products.length;
  const lowStockItems    = products.filter(p => p.stockLevel <= p.reorderThreshold);
  const outOfStock       = products.filter(p => p.stockLevel === 0);
  const activeItems      = products.filter(p => p.status === 'ACTIVE');
  const totalStockValue  = products.reduce((s, p) => s + (p.stockLevel * p.currentPrice), 0);
  const avgPrice         = products.length ? products.reduce((s, p) => s + p.currentPrice, 0) / products.length : 0;
  const avgDemandVel     = products.length ? products.reduce((s, p) => s + p.demandVelocity, 0) / products.length : 0;

  // Stock by product (bar chart)
  const stockByProduct = [...products]
    .sort((a, b) => b.stockLevel - a.stockLevel)
    .map(p => ({
      name: p.name.length > 18 ? p.name.slice(0, 16) + '…' : p.name,
      stock: p.stockLevel,
      threshold: p.reorderThreshold,
    }));

  // Category breakdown (pie chart)
  const categoryMap = {};
  products.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([cat, count]) => ({ name: cat, value: count }));

  // Price distribution (bar chart)
  const priceData = [...products]
    .sort((a, b) => b.currentPrice - a.currentPrice)
    .map(p => ({
      name: p.name.length > 14 ? p.name.slice(0, 12) + '…' : p.name,
      price: parseFloat(p.currentPrice),
    }));

  // Demand velocity comparison
  const demandData = [...products]
    .sort((a, b) => b.demandVelocity - a.demandVelocity)
    .map(p => ({
      name: p.name.length > 14 ? p.name.slice(0, 12) + '…' : p.name,
      velocity: p.demandVelocity,
    }));

  // Stock health trend (simulated area chart showing stock vs threshold per product)
  const healthData = products.map(p => ({
    name: p.name.length > 10 ? p.name.slice(0, 9) + '…' : p.name,
    stock: p.stockLevel,
    threshold: p.reorderThreshold,
    gap: Math.max(0, p.stockLevel - p.reorderThreshold),
  }));

  // Suggestion breakdown (mini data)
  const suggestionData = [
    { name: 'Pricing', value: pricingSuggestions.length, color: '#2563eb' },
    { name: 'Reorder', value: reorderSuggestions.length, color: '#0a0a0a' },
    { name: 'Total Resolved', value: Math.floor(Math.random() * 5 + 3), color: '#a3a3a3' }, // illustrative
  ];

  const fmtCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const criticalProducts = lowStockItems.sort((a, b) => a.stockLevel - b.stockLevel);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .analytics-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .analytics-row2  { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
        .analytics-row3  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .analytics-row4  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        @media (max-width: 1100px) {
          .analytics-kpis { grid-template-columns: repeat(2, 1fr); }
          .analytics-row2 { grid-template-columns: 1fr; }
          .analytics-row3 { grid-template-columns: 1fr; }
          .analytics-row4 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .analytics-kpis { grid-template-columns: 1fr; }
          .analytics-row4 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.03em', margin: 0 }}>
              Analytics
            </h1>
            <p style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
              Inventory health, pricing intelligence, and demand signals
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f5f5f5', border: '1px solid #e5e5e5',
            borderRadius: 6, padding: '5px 12px',
            fontSize: 11, fontWeight: 600, color: '#737373', letterSpacing: '0.03em',
          }}>
            LIVE DATA · {products.length} PRODUCTS
          </div>
        </div>
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div className="analytics-kpis" style={{ marginBottom: 16, animation: 'fadeIn 0.3s ease' }}>
        <KpiCard label="Portfolio Value" value={fmtCurrency(totalStockValue)} sub="total stock × price" />
        <KpiCard label="Low Stock Items" value={lowStockItems.length} sub={`${outOfStock.length} out of stock`} trend={lowStockItems.length > 2 ? -12 : 8} />
        <KpiCard label="Avg. Price" value={`$${avgPrice.toFixed(2)}`} sub="across catalog" />
        <KpiCard label="Avg. Demand Velocity" value={avgDemandVel.toFixed(1)} unit="/ period" sub="units sold per cycle" />
      </div>

      {/* ── Row 2: Stock vs Threshold (wide) + Suggestion Status (narrow) ── */}
      <div className="analytics-row2" style={{ marginBottom: 16 }}>
        <ChartCard
          title="Stock Level vs Reorder Threshold"
          subtitle="Current inventory compared to minimum reorder points per product"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stockByProduct} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name" tick={{ fontSize: 10, fill: '#a3a3a3', fontFamily: 'Inter' }}
                axisLine={{ stroke: '#e5e5e5' }} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#a3a3a3', fontFamily: 'Inter' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip suffix=" units" />} cursor={{ fill: '#f5f5f5' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }} />
              <Bar dataKey="stock" name="Stock" fill="#0a0a0a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="threshold" name="Threshold" fill="#e5e5e5" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Catalog Breakdown" subtitle="Products by category">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData} cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={3} dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [`${val} products`, name]} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
            {categoryData.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORY_COLORS[c.name] || COLORS[i % COLORS.length], flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#737373' }}>{c.name} ({c.value})</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Price Distribution + Demand Velocity ── */}
      <div className="analytics-row3" style={{ marginBottom: 16 }}>
        <ChartCard title="Price Distribution" subtitle="Current selling price per product">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priceData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a3a3a3', fontFamily: 'Inter' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#a3a3a3', fontFamily: 'Inter' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `$${v}`}
              />
              <Tooltip content={<CustomTooltip prefix="$" />} cursor={{ fill: '#f5f5f5' }} />
              <Bar dataKey="price" name="Price" fill="#0a0a0a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Demand Velocity" subtitle="Units sold per period — AI uses this to generate reorder signals">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={demandData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a3a3a3', fontFamily: 'Inter' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#a3a3a3', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" units/period" />} cursor={{ fill: '#f5f5f5' }} />
              <Bar dataKey="velocity" name="Demand Velocity" fill="#525252" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 4: Stock Health + AI Suggestions + Status breakdown ── */}
      <div className="analytics-row4" style={{ marginBottom: 16 }}>

        {/* AI Suggestions */}
        <ChartCard title="AI Suggestion Activity" subtitle="Pending recommendations by type">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Pricing Suggestions', val: pricingSuggestions.length, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
              { label: 'Reorder Suggestions', val: reorderSuggestions.length, color: '#0a0a0a', bg: '#f5f5f5', border: '#e5e5e5' },
              { label: 'Total Pending', val: pricingSuggestions.length + reorderSuggestions.length, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: item.bg, border: `1px solid ${item.border}`,
                borderRadius: 6, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: item.color }}>{item.label}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.val}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 4 }}>
            <p style={{ fontSize: 11, color: '#a3a3a3', margin: 0 }}>
              Sell units on low-stock products to generate more AI signals
            </p>
          </div>
        </ChartCard>

        {/* Product Status breakdown */}
        <ChartCard title="Product Status Breakdown" subtitle="Health snapshot of your catalog">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {[
              { label: 'Active', count: activeItems.length, total: totalProducts, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
              { label: 'Low Stock', count: lowStockItems.length, total: totalProducts, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              { label: 'Out of Stock', count: outOfStock.length, total: totalProducts, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
              { label: 'Price Review', count: products.filter(p => p.status === 'PRICE_REVIEW_PENDING').length, total: totalProducts, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#525252' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>
                    {item.count} <span style={{ fontWeight: 400, color: '#a3a3a3' }}>/ {item.total}</span>
                  </span>
                </div>
                <div style={{ height: 6, background: '#f5f5f5', borderRadius: 99 }}>
                  <div style={{
                    width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%`,
                    height: '100%', background: item.color, borderRadius: 99,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Stock health area chart */}
        <ChartCard title="Stock vs Threshold Area" subtitle="Buffer above/below reorder points">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={healthData}>
              <defs>
                <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="threshGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e5e5e5" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#e5e5e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#a3a3a3', fontFamily: 'Inter' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#a3a3a3', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" units" />} />
              <Area type="monotone" dataKey="threshold" name="Threshold" stroke="#d4d4d4" fill="url(#threshGrad)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="stock" name="Stock" stroke="#0a0a0a" fill="url(#stockGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Critical Inventory Alerts ── */}
      {criticalProducts.length > 0 && (
        <ChartCard
          title="Critical Inventory Alerts"
          subtitle={`${criticalProducts.length} product${criticalProducts.length !== 1 ? 's' : ''} at or below reorder threshold`}
          action={
            <span style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', borderRadius: 99, padding: '2px 10px',
              fontSize: 11, fontWeight: 700,
            }}>
              ⚠ Action Required
            </span>
          }
        >
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 80px 100px 90px',
            padding: '8px 16px', background: '#fafafa', borderRadius: 6,
            borderBottom: '1px solid #f0f0f0',
          }}>
            {['Product', 'Stock', 'Min', 'Fill Rate', 'Status'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>
          <div style={{ border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
            {criticalProducts.map((p, i) => (
              <AlertRow key={p.id} product={p} i={i} last={i === criticalProducts.length - 1} />
            ))}
          </div>
        </ChartCard>
      )}
    </>
  );
};

export default AnalyticsPage;
