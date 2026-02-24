import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Voucher {
  id: string;
  amount: number;
  description: string;
  payee: string;
  date: string | null;
  created_at: string;
}

export default function Vouchers() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: '', description: '', payee: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  async function fetchVouchers() {
    const { data, error: e } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    if (e) {
      setError(e.message);
    } else {
      setVouchers((data as Voucher[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchVouchers();
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

    const { error: insertError } = await supabase.from('vouchers').insert({
      amount: parseFloat(form.amount),
      description: form.description,
      payee: form.payee,
      date: form.date || null,
      tenant_id: profile?.tenant_id ?? null,
      created_by: user!.id,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setForm({ amount: '', description: '', payee: '', date: '' });
      await fetchVouchers();
    }
    setSubmitting(false);
  }

  return (
    <div>
      <h2>Vouchers</h2>
      <form onSubmit={handleSubmit} className="form-card">
        <h3>New Voucher</h3>
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
          <label>Payee</label>
          <input
            type="text"
            required
            value={form.payee}
            onChange={e => setForm(f => ({ ...f, payee: e.target.value }))}
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
          {submitting ? 'Saving…' : 'Add Voucher'}
        </button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Payee</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={4}>No vouchers yet.</td>
              </tr>
            ) : (
              vouchers.map(v => (
                <tr key={v.id}>
                  <td>{v.date ?? v.created_at.slice(0, 10)}</td>
                  <td>{v.payee}</td>
                  <td>{v.description}</td>
                  <td>{v.amount.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
