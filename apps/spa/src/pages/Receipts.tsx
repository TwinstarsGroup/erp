import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Receipt {
  id: string;
  amount: number;
  description: string;
  payer: string;
  date: string | null;
  created_at: string;
}

export default function Receipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: '', description: '', payer: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  async function fetchReceipts() {
    const { data, error: e } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false });
    if (e) {
      setError(e.message);
    } else {
      setReceipts((data as Receipt[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReceipts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user!.id)
      .single();

    if (profileError) {
      setError(`Could not load profile: ${profileError.message}`);
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('receipts').insert({
      amount: parseFloat(form.amount),
      description: form.description,
      payer: form.payer,
      date: form.date || null,
      tenant_id: profile?.tenant_id ?? null,
      created_by: user!.id,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setForm({ amount: '', description: '', payer: '', date: '' });
      await fetchReceipts();
    }
    setSubmitting(false);
  }

  return (
    <div>
      <h2>Receipts</h2>
      <form onSubmit={handleSubmit} className="form-card">
        <h3>New Receipt</h3>
        <div className="form-row">
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          />
        </div>
        <div className="form-row">
          <label>Description</label>
          <input
            type="text"
            required
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="form-row">
          <label>Payer</label>
          <input
            type="text"
            required
            value={form.payer}
            onChange={e => setForm(f => ({ ...f, payer: e.target.value }))}
          />
        </div>
        <div className="form-row">
          <label>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Saving…' : 'Add Receipt'}
        </button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Payer</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={4}>No receipts yet.</td>
              </tr>
            ) : (
              receipts.map(r => (
                <tr key={r.id}>
                  <td>{r.date ?? r.created_at.slice(0, 10)}</td>
                  <td>{r.payer}</td>
                  <td>{r.description}</td>
                  <td>{r.amount.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
