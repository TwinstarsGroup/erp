'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Voucher {
  id: string;
  docNumber: string;
  date: string;
  amount: number;
  description: string;
  payee: string;
  emailedAt?: string;
  emailedTo?: string;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [form, setForm] = useState({ amount: '', description: '', payee: '' });
  const [emailForm, setEmailForm] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch(`${API_URL}/vouchers`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: Voucher[]) => setVouchers(data))
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: parseFloat(form.amount), description: form.description, payee: form.payee }),
      });
      if (!res.ok) throw new Error('Failed to create voucher');
      setForm({ amount: '', description: '', payee: '' });
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (id: string) => {
    const to = emailForm[id];
    if (!to) return;
    try {
      const res = await fetch(`${API_URL}/vouchers/${id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      alert('Email sent!');
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <h2>Payment Vouchers</h2>

      <form onSubmit={create} style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          placeholder="Payee"
          value={form.payee}
          onChange={(e) => setForm({ ...form, payee: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Create Voucher
        </button>
      </form>

      <table style={{ marginTop: '24px', width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Doc #</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Amount</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Payee</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{v.docNumber}</td>
              <td style={{ padding: '8px' }}>{new Date(v.date).toLocaleDateString()}</td>
              <td style={{ padding: '8px' }}>{v.amount.toFixed(2)}</td>
              <td style={{ padding: '8px' }}>{v.description}</td>
              <td style={{ padding: '8px' }}>{v.payee}</td>
              <td style={{ padding: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`${API_URL}/vouchers/${v.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: '4px 8px', background: '#e53e3e', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                >
                  PDF
                </a>
                <input
                  placeholder="Email to"
                  value={emailForm[v.id] || ''}
                  onChange={(e) => setEmailForm({ ...emailForm, [v.id]: e.target.value })}
                  style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                />
                <button
                  onClick={() => sendEmail(v.id)}
                  style={{ padding: '4px 8px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                >
                  Email
                </button>
                {v.emailedAt && <span style={{ fontSize: '12px', color: '#666' }}>Sent to {v.emailedTo}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
