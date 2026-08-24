// components/SuggestionCard.jsx
import React, { useState } from 'react';

const formatCurrency = (val) =>
  val != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
    : '—';

const formatPct = (val) =>
  val != null ? `${Math.round(val * 100)}%` : '—';

const DirectionChip = ({ direction }) => {
  const map = {
    INCREASE: { label: '↑ Increase', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    DECREASE: { label: '↓ Decrease', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    HOLD:     { label: '→ Hold',     color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  };
  const s = map[direction] || { label: direction, color: '#737373', bg: '#f5f5f5', border: '#e5e5e5' };
  return (
    <span style={{
      display: 'inline-block',
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, borderRadius: 99,
      padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>
      {s.label}
    </span>
  );
};

const ConfidenceBar = ({ value }) => {
  const pct = Math.round((value ?? 0) * 100);
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#a3a3a3', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confidence</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: '#f5f5f5', borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
};

const MetaItem = ({ label, value, mono }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: 10, fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', fontFamily: mono ? 'ui-monospace, monospace' : 'Inter' }}>{value}</span>
  </div>
);

const ActionBtn = ({ children, onClick, variant }) => {
  const [hov, setHov] = useState(false);
  const styles = {
    accept: {
      base:  { background: '#0a0a0a', color: '#fff', border: '1px solid #0a0a0a' },
      hover: { background: '#171717' },
    },
    reject: {
      base:  { background: '#fff', color: '#737373', border: '1px solid #e5e5e5' },
      hover: { background: '#f5f5f5', color: '#0a0a0a', borderColor: '#d4d4d4' },
    },
  };
  const s = styles[variant];
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, cursor: 'pointer',
        borderRadius: 6, padding: '7px 12px',
        fontSize: 12, fontWeight: 600, fontFamily: 'Inter',
        ...(hov ? { ...s.base, ...s.hover } : s.base),
        transition: 'all 0.12s ease',
      }}
    >
      {children}
    </button>
  );
};

const SuggestionCard = ({ suggestion, product, type, onAccept, onReject }) => {
  const isPricing = type === 'pricing';
  const isPending = suggestion.status === 'PENDING';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: 8,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.25s ease',
      transition: 'box-shadow 0.15s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top accent bar */}
      <div style={{
        height: 3,
        background: isPricing
          ? 'linear-gradient(90deg, #2563eb, #7c3aed)'
          : 'linear-gradient(90deg, #0a0a0a, #525252)',
      }} />

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{
                fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: isPricing ? '#2563eb' : '#525252',
              }}>
                {isPricing ? '● Pricing' : '● Reorder'}
              </span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', margin: 0, lineHeight: 1.3 }}>
              {product?.name || 'Unknown Product'}
            </h3>
            <code style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 10, color: '#a3a3a3', background: 'none', border: 'none', padding: 0,
            }}>
              {suggestion.productId}
            </code>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 99,
            background: isPending ? '#f5f5f5' : '#f0fdf4',
            color: isPending ? '#737373' : '#16a34a',
            border: isPending ? '1px solid #e5e5e5' : '1px solid #bbf7d0',
            flexShrink: 0,
          }}>
            {suggestion.status}
          </span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #f5f5f5' }} />

        {/* Metrics */}
        {isPricing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
            <MetaItem label="Current Price" value={formatCurrency(product?.currentPrice)} />
            <MetaItem label="Suggested Price" value={formatCurrency(suggestion.recommendedPrice)} />
            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
                Direction
              </span>
              <DirectionChip direction={suggestion.direction} />
            </div>
            <MetaItem label="Trigger" value={(suggestion.triggerReason || '').replace(/_/g, ' ')} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
            <MetaItem label="Current Stock" value={product ? `${product.stockLevel} units` : '—'} />
            <MetaItem label="Suggested Qty" value={`${suggestion.recommendedQuantity} units`} />
            <MetaItem label="Trigger" value={(suggestion.triggerReason || '').replace(/_/g, ' ')} />
          </div>
        )}

        {/* Confidence bar */}
        <ConfidenceBar value={suggestion.confidence} />

        {/* Reasoning */}
        <div style={{
          background: '#fafafa', border: '1px solid #f0f0f0',
          borderRadius: 6, padding: '10px 12px',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
            AI Reasoning
          </span>
          <p style={{ fontSize: 12, color: '#525252', lineHeight: 1.5, margin: 0 }}>
            {suggestion.reasoning || 'No reasoning provided.'}
          </p>
        </div>

        {/* Action buttons */}
        {isPending && (
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            <ActionBtn variant="accept" onClick={() => onAccept(suggestion.id)}>
              Accept
            </ActionBtn>
            <ActionBtn variant="reject" onClick={() => onReject(suggestion.id)}>
              Dismiss
            </ActionBtn>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionCard;