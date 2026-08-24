// components/ProductCard.jsx
import React, { useState } from 'react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE:               { label: 'Active',         color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    PRICE_REVIEW_PENDING: { label: 'Price Review',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    OUT_OF_STOCK:         { label: 'Out of Stock',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  };
  const s = map[status] || { label: status, color: '#737373', bg: '#f5f5f5', border: '#e5e5e5' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, borderRadius: 99,
      padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
};

const MetaRow = ({ label, value, highlight }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <span style={{ fontSize: 11, fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {label}
    </span>
    <span style={{ fontSize: 13, fontWeight: 600, color: highlight ? '#dc2626' : '#0a0a0a' }}>
      {value}
    </span>
  </div>
);

const ActionButton = ({ children, onClick, variant = 'default', disabled }) => {
  const [hovered, setHovered] = useState(false);
  const styles = {
    default: {
      base:    { background: '#fff', color: '#0a0a0a', border: '1px solid #e5e5e5' },
      hover:   { background: '#f5f5f5', borderColor: '#d4d4d4' },
    },
    primary: {
      base:    { background: '#0a0a0a', color: '#fff', border: '1px solid #0a0a0a' },
      hover:   { background: '#171717', borderColor: '#171717' },
    },
    success: {
      base:    { background: '#fff', color: '#16a34a', border: '1px solid #e5e5e5' },
      hover:   { background: '#f0fdf4', borderColor: '#bbf7d0' },
    },
  };
  const s = styles[variant];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => { e.preventDefault(); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 6, padding: '6px 10px',
        fontSize: 12, fontWeight: 500, fontFamily: 'Inter',
        ...(hovered && !disabled ? { ...s.base, ...s.hover } : s.base),
        transition: 'all 0.12s ease',
      }}
    >
      {children}
    </button>
  );
};

const ProductCard = ({ product, onSimulateOrder, onReceiveInventory }) => {
  const isLowStock = product.stockLevel <= product.reorderThreshold;

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${isLowStock ? '#fde68a' : '#e5e5e5'}`,
      borderRadius: 8,
      padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      animation: 'fadeIn 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </h3>
          <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: '#a3a3a3', marginTop: 2, display: 'block' }}>
            {product.sku}
          </span>
        </div>
        <StatusBadge status={product.status} />
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #f5f5f5' }} />

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
        <MetaRow label="Category" value={product.category} />
        <MetaRow label="Price" value={formatCurrency(product.currentPrice)} />
        <MetaRow
          label="Stock"
          value={`${product.stockLevel} units`}
          highlight={isLowStock}
        />
        <MetaRow label="Threshold" value={`${product.reorderThreshold} units`} />
        <MetaRow label="Velocity" value={`${product.demandVelocity} / period`} />
      </div>

      {/* Low stock warning */}
      {isLowStock && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 6, padding: '6px 10px',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: '#92400e', fontWeight: 500,
        }}>
          <span>⚠</span>
          Stock below reorder threshold — AI suggestions may be generated
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid #f5f5f5' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionButton onClick={() => onSimulateOrder(product.id, 1)}>Sell 1</ActionButton>
        <ActionButton onClick={() => onSimulateOrder(product.id, 5)}>Sell 5</ActionButton>
        <ActionButton variant="success" onClick={() => onReceiveInventory(product.id, 10)}>+ Stock</ActionButton>
      </div>
    </div>
  );
};

export default ProductCard;