'use client';

import { useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
import { formatNaira, getUser } from '@/lib/auth';

type ProductForm = {
  code: string;
  name: string;
  model: string;
  category: string;
  cost_price: number | string;
  selling_price: number | string;
  stock: number | string;
  low_stock_alert: number | string;
};

const emptyForm: ProductForm = {
  code: '',
  name: '',
  model: '',
  category: 'Phone',
  cost_price: 0,
  selling_price: 0,
  stock: 0,
  low_stock_alert: 3,
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
      {hint ? <small className="field-hint">{hint}</small> : null}
    </div>
  );
}

export default function Products() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [edit, setEdit] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user) {
      location.href = '/login';
      return;
    }
    if (user.role !== 'admin') {
      location.href = '/cashier';
      return;
    }
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) setMessage(error.message);
    setItems(data || []);
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) =>
      [p.code, p.name, p.model, p.category].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [items, search]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const payload = {
      code: String(form.code).trim().toUpperCase(),
      name: String(form.name).trim(),
      model: String(form.model || '').trim(),
      category: form.category,
      cost_price: Number(form.cost_price || 0),
      selling_price: Number(form.selling_price || 0),
      stock: Number(form.stock || 0),
      low_stock_alert: Number(form.low_stock_alert || 0),
    };

    if (edit) {
      const { error } = await supabase.from('products').update(payload).eq('id', edit);
      if (error) return setMessage(error.message);
      setMessage('Product updated successfully.');
      setEdit(null);
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) return setMessage(error.message);
      setMessage('Product saved successfully.');
    }

    setForm(emptyForm);
    load();
  }

  async function del(id: string) {
    if (!confirm('Delete this product? This should only be used for test or wrongly created items.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return setMessage(error.message);
    setMessage('Product deleted successfully.');
    load();
  }

  function startEdit(p: any) {
    setEdit(p.id);
    setForm({
      code: p.code || '',
      name: p.name || '',
      model: p.model || '',
      category: p.category || 'Phone',
      cost_price: p.cost_price || 0,
      selling_price: p.selling_price || 0,
      stock: p.stock || 0,
      low_stock_alert: p.low_stock_alert || 3,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <Shell>
      <div className="page-heading">
        <div>
          <h1>Products & Inventory</h1>
          <p>Add new goods, update prices, restock quantities and monitor low stock items.</p>
        </div>
      </div>

      <div className="card product-card">
        <div className="section-title-row">
          <div>
            <h2>{edit ? 'Edit Product' : 'Add Product / Restock'}</h2>
            <p className="muted">All labelled fields help the admin avoid wrong entries.</p>
          </div>
          {edit ? <span className="badge warn">Editing existing product</span> : <span className="badge">New product</span>}
        </div>

        {message ? <div className={message.toLowerCase().includes('success') ? 'success-box' : 'error-box'}>{message}</div> : null}

        <form onSubmit={save} className="professional-form">
          <Field label="Product Code" hint="Unique code, e.g. PH001, ACC001">
            <input
              className="input"
              placeholder="PH001"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </Field>

          <Field label="Product Name" hint="Example: Samsung A15, iPhone Charger">
            <input
              className="input"
              placeholder="Enter product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>

          <Field label="Model / Description" hint="Storage, colour, capacity or other details">
            <input
              className="input"
              placeholder="128GB / 6GB RAM / Black"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </Field>

          <Field label="Category" hint="Choose the type of item">
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Phone</option>
              <option>Accessory</option>
              <option>Service</option>
            </select>
          </Field>

          <Field label="Cost Price (₦)" hint="Amount you bought it">
            <input
              className="input"
              type="number"
              min="0"
              placeholder="150000"
              value={form.cost_price}
              onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
            />
          </Field>

          <Field label="Selling Price (₦)" hint="Amount customer will pay">
            <input
              className="input"
              type="number"
              min="0"
              placeholder="180000"
              value={form.selling_price}
              onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
            />
          </Field>

          <Field label="Stock Quantity" hint="Number currently available">
            <input
              className="input"
              type="number"
              min="0"
              placeholder="10"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </Field>

          <Field label="Low Stock Alert" hint="Warn admin when stock reaches this number">
            <input
              className="input"
              type="number"
              min="0"
              placeholder="3"
              value={form.low_stock_alert}
              onChange={(e) => setForm({ ...form, low_stock_alert: e.target.value })}
            />
          </Field>

          <div className="form-actions">
            <button className="btn green" type="submit">{edit ? 'Update Product' : 'Save Product'}</button>
            {edit ? (
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setEdit(null);
                  setForm(emptyForm);
                  setMessage('Edit cancelled.');
                }}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-title-row">
          <div>
            <h2>Inventory</h2>
            <p className="muted">Search by code, product name, model or category.</p>
          </div>
          <input
            className="input search-input"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>Category</th>
                <th>Cost</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((p) => {
                const lowLevel = Number(p.low_stock_alert || 0);
                const stock = Number(p.stock || 0);
                const isLow = stock <= lowLevel;
                return (
                  <tr key={p.id}>
                    <td><strong>{p.code}</strong></td>
                    <td>{p.name}<br /><small className="muted">{p.model}</small></td>
                    <td>{p.category}</td>
                    <td>{formatNaira(p.cost_price)}</td>
                    <td>{formatNaira(p.selling_price)}</td>
                    <td>{p.stock}</td>
                    <td>{isLow ? <span className="badge danger-badge">Low stock</span> : <span className="badge ok-badge">Available</span>}</td>
                    <td className="action-cell">
                      <button className="btn secondary" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn danger" onClick={() => del(p.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {!filteredItems.length ? (
                <tr><td colSpan={8} className="empty-state">No product found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
