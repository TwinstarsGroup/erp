'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Receipt {
  id: string;
  docNumber: string;
  date: string;
  amount: number;
  description: string;
  payer: string;
  emailedAt?: string;
  emailedTo?: string;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [form, setForm] = useState({ amount: '', description: '', payer: '' });
  const [emailForm, setEmailForm] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch(`${API_URL}/receipts`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: Receipt[]) => setReceipts(data))
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: parseFloat(form.amount), description: form.description, payer: form.payer }),
      });
      if (!res.ok) throw new Error('Failed to create receipt');
      setForm({ amount: '', description: '', payer: '' });
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
      const res = await fetch(`${API_URL}/receipts/${id}/email`, {
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
      <h2>Receipts</h2>

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
          placeholder="Payer"
          value={form.payer}
          onChange={(e) => setForm({ ...form, payer: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Create Receipt
        </button>
      </form>

      <table style={{ marginTop: '24px', width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Doc #</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Amount</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Payer</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{r.docNumber}</td>
              <td style={{ padding: '8px' }}>{new Date(r.date).toLocaleDateString()}</td>
              <td style={{ padding: '8px' }}>{r.amount.toFixed(2)}</td>
              <td style={{ padding: '8px' }}>{r.description}</td>
              <td style={{ padding: '8px' }}>{r.payer}</td>
              <td style={{ padding: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`${API_URL}/receipts/${r.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: '4px 8px', background: '#e53e3e', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                >
                  PDF
                </a>
                <input
                  placeholder="Email to"
                  value={emailForm[r.id] || ''}
                  onChange={(e) => setEmailForm({ ...emailForm, [r.id]: e.target.value })}
                  style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                />
                <button
                  onClick={() => sendEmail(r.id)}
                  style={{ padding: '4px 8px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                >
                  Email
                </button>
                {r.emailedAt && <span style={{ fontSize: '12px', color: '#666' }}>Sent to {r.emailedTo}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
