// pages/ProductsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CATEGORIES = ['ELECTRONICS', 'APPAREL', 'HOME', 'SPORTS', 'BEAUTY', 'FOOD', 'OTHER'];
const STATUSES = ['ACTIVE', 'OUT_OF_STOCK', 'PRICE_REVIEW_PENDING'];

const fmtCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// ── Shared styles ────────────────────────────────────────────────────────────

const inputStyle = (error) => ({
  width: '100%', padding: '8px 12px',
  border: `1px solid ${error ? '#fecaca' : '#e5e5e5'}`,
  borderRadius: 6, fontSize: 13, fontFamily: 'Inter',
  color: '#0a0a0a', outline: 'none',
  background: error ? '#fef2f2' : '#fff',
  transition: 'border-color 0.15s',
});

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#737373', textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: 4,
};

const btnBase = {
  cursor: 'pointer', borderRadius: 6,
  padding: '8px 16px', fontSize: 13, fontWeight: 500,
  fontFamily: 'Inter', transition: 'all 0.12s ease',
};

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE:               { label: 'Active',       color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    PRICE_REVIEW_PENDING: { label: 'Price Review', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    OUT_OF_STOCK:         { label: 'Out of Stock', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  };
  const s = map[status] || { label: status, color: '#737373', bg: '#f5f5f5', border: '#e5e5e5' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, borderRadius: 99,
      padding: '2px 8px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
};

// ── Product Form Modal ───────────────────────────────────────────────────────

const EMPTY_FORM = {
  id: '', sku: '', name: '', category: 'ELECTRONICS',
  currentPrice: '', stockLevel: '', reorderThreshold: '',
  demandVelocity: '', status: 'ACTIVE',
};

const Field = ({ id, label, type = 'text', opts, form, setForm, errors, mode }) => {
  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
  };
  
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {type === 'select' ? (
        <select
          value={form[id]} onChange={e => set(id, e.target.value)}
          style={{ ...inputStyle(errors[id]), appearance: 'none', cursor: 'pointer' }}
        >
          {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
        </select>
      ) : (
        <input
          type={type} value={form[id]}
          onChange={e => set(id, e.target.value)}
          disabled={mode === 'edit' && id === 'id'}
          style={{
            ...inputStyle(errors[id]),
            ...(mode === 'edit' && id === 'id' ? { background: '#f5f5f5', color: '#a3a3a3', cursor: 'not-allowed' } : {}),
          }}
          placeholder={type === 'number' ? '0' : ''}
        />
      )}
      {errors[id] && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{errors[id]}</p>}
    </div>
  );
};

const ProductFormModal = ({ mode, initial, onSave, onClose }) => {
  const [form, setForm] = useState(mode === 'edit' ? {
    ...initial,
    currentPrice: initial.currentPrice ?? '',
    stockLevel: initial.stockLevel ?? '',
    reorderThreshold: initial.reorderThreshold ?? '',
    demandVelocity: initial.demandVelocity ?? '',
  } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.id.trim())              e.id = 'Required';
    if (!form.sku.trim())             e.sku = 'Required';
    if (!form.name.trim())            e.name = 'Required';
    if (!form.currentPrice || isNaN(Number(form.currentPrice)) || Number(form.currentPrice) <= 0)
      e.currentPrice = 'Must be a positive number';
    if (form.stockLevel === '' || isNaN(Number(form.stockLevel)) || Number(form.stockLevel) < 0)
      e.stockLevel = 'Must be 0 or more';
    if (form.reorderThreshold === '' || isNaN(Number(form.reorderThreshold)) || Number(form.reorderThreshold) < 0)
      e.reorderThreshold = 'Must be 0 or more';
    if (form.demandVelocity === '' || isNaN(Number(form.demandVelocity)) || Number(form.demandVelocity) < 0)
      e.demandVelocity = 'Must be 0 or more';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        currentPrice: Number(form.currentPrice),
        stockLevel: Number(form.stockLevel),
        reorderThreshold: Number(form.reorderThreshold),
        demandVelocity: Number(form.demandVelocity),
      };
      if (mode === 'create') {
        await api.createProduct(payload);
      } else {
        await api.updateProduct(form.id, payload);
      }
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #e5e5e5',
        boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              {mode === 'create' ? 'Create Product' : 'Edit Product'}
            </h2>
            <p style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>
              {mode === 'create' ? 'Add a new product to your catalog' : `Editing ${initial?.name}`}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{
            background: 'none', border: '1px solid #e5e5e5', borderRadius: 6,
            width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#737373',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field id="id" label="Product ID" form={form} setForm={setForm} errors={errors} mode={mode} />
            <Field id="sku" label="SKU" form={form} setForm={setForm} errors={errors} mode={mode} />
          </div>
          <Field id="name" label="Product Name" form={form} setForm={setForm} errors={errors} mode={mode} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field id="category" label="Category" type="select" opts={CATEGORIES} form={form} setForm={setForm} errors={errors} mode={mode} />
            <Field id="status" label="Status" type="select" opts={STATUSES} form={form} setForm={setForm} errors={errors} mode={mode} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field id="currentPrice" label="Current Price ($)" type="number" form={form} setForm={setForm} errors={errors} mode={mode} />
            <Field id="stockLevel" label="Stock Level" type="number" form={form} setForm={setForm} errors={errors} mode={mode} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field id="reorderThreshold" label="Reorder Threshold" type="number" form={form} setForm={setForm} errors={errors} mode={mode} />
            <Field id="demandVelocity" label="Demand Velocity" type="number" form={form} setForm={setForm} errors={errors} mode={mode} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 8, padding: '16px 24px',
          borderTop: '1px solid #f0f0f0', justifyContent: 'flex-end',
        }}>
          <button type="button" onClick={onClose} style={{
            ...btnBase, background: '#fff', border: '1px solid #e5e5e5', color: '#737373',
          }}>Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={saving} style={{
            ...btnBase, background: '#0a0a0a', color: '#fff', border: '1px solid #0a0a0a',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving…' : mode === 'create' ? 'Create Product' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

const DeleteModal = ({ product, onConfirm, onClose }) => {
  const [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: '100%', maxWidth: 400,
        border: '1px solid #e5e5e5', boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        padding: 24,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, background: '#fef2f2',
          border: '1px solid #fecaca', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18, marginBottom: 16,
        }}>⚠</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Delete Product</h3>
        <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: '#0a0a0a' }}>{product.name}</strong>?
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{
            ...btnBase, background: '#fff', border: '1px solid #e5e5e5', color: '#737373',
          }}>Cancel</button>
          <button type="button" onClick={go} disabled={loading} style={{
            ...btnBase, background: '#dc2626', color: '#fff', border: '1px solid #dc2626',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Products Page ────────────────────────────────────────────────────────

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [modal, setModal] = useState(null); // null | { type: 'create' } | { type: 'edit', product } | { type: 'delete', product }
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (product) => {
    await api.deleteProduct(product.id);
    setModal(null);
    showToast(`"${product.name}" deleted`);
    load();
  };

  const handleSave = () => {
    setModal(null);
    showToast(modal?.type === 'create' ? 'Product created!' : 'Product updated!');
    load();
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'ALL' || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .prod-row:hover { background: #fafafa; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#dc2626' : '#0a0a0a',
          color: '#fff', padding: '10px 16px', borderRadius: 8,
          fontSize: 13, fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>{toast.message}</div>
      )}

      {/* Modals */}
      {modal?.type === 'create' && (
        <ProductFormModal mode="create" onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <ProductFormModal mode="edit" initial={modal.product} onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal product={modal.product} onConfirm={() => handleDelete(modal.product)} onClose={() => setModal(null)} />
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.03em', margin: 0 }}>
            Products
          </h1>
          <p style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
            {products.length} product{products.length !== 1 ? 's' : ''} in catalog
          </p>
        </div>
        <button type="button" onClick={() => setModal({ type: 'create' })} style={{
          ...btnBase, background: '#0a0a0a', color: '#fff', border: '1px solid #0a0a0a',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a3a3a3', fontSize: 13 }}>⌕</span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or ID…"
            style={{ ...inputStyle(false), paddingLeft: 28 }}
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{
          ...inputStyle(false), flex: '0 0 160px', appearance: 'none', cursor: 'pointer',
        }}>
          <option value="ALL">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '2px solid #e5e5e5', borderTopColor: '#0a0a0a',
            animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden' }}>
          {/* Table Head */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr 120px 80px 80px 80px 120px 100px',
            gap: 0, borderBottom: '1px solid #f0f0f0',
            background: '#fafafa', padding: '10px 20px',
          }}>
            {['Name', 'SKU / ID', 'Category', 'Price', 'Stock', 'Threshold', 'Status', 'Actions'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Table Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a3a3a3', fontSize: 13 }}>
              No products match your search.
            </div>
          ) : (
            filtered.map((p, i) => (
              <div key={p.id} className="prod-row" style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 120px 80px 80px 80px 120px 100px',
                gap: 0, padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid #f5f5f5' : 'none',
                alignItems: 'center',
                transition: 'background 0.1s',
                animation: 'fadeIn 0.15s ease',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: '#737373', margin: 0 }}>{p.sku}</p>
                  <p style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: '#d4d4d4', margin: 0 }}>{p.id}</p>
                </div>
                <span style={{ fontSize: 12, color: '#525252', fontWeight: 500 }}>{p.category}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a' }}>{fmtCurrency(p.currentPrice)}</span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: p.stockLevel <= p.reorderThreshold ? '#d97706' : '#0a0a0a',
                }}>
                  {p.stockLevel}
                </span>
                <span style={{ fontSize: 13, color: '#737373' }}>{p.reorderThreshold}</span>
                <StatusBadge status={p.status} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => setModal({ type: 'edit', product: p })} style={{
                    cursor: 'pointer', border: '1px solid #e5e5e5', borderRadius: 5,
                    background: '#fff', padding: '4px 10px', fontSize: 11, fontWeight: 500,
                    color: '#525252', fontFamily: 'Inter', transition: 'all 0.12s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = '#d4d4d4'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => setModal({ type: 'delete', product: p })} style={{
                    cursor: 'pointer', border: '1px solid #fecaca', borderRadius: 5,
                    background: '#fef2f2', padding: '4px 10px', fontSize: 11, fontWeight: 500,
                    color: '#dc2626', fontFamily: 'Inter', transition: 'all 0.12s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}
                  >
                    Del
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default ProductsPage;
