import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { user } = useAuth();
  const [receiptsCount, setReceiptsCount] = useState<number | null>(null);
  const [vouchersCount, setVouchersCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      const [{ count: rc, error: re }, { count: vc, error: ve }] = await Promise.all([
        supabase.from('receipts').select('*', { count: 'exact', head: true }),
        supabase.from('vouchers').select('*', { count: 'exact', head: true }),
      ]);
      if (re || ve) {
        setError((re ?? ve)!.message);
      } else {
        setReceiptsCount(rc ?? 0);
        setVouchersCount(vc ?? 0);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div>
      <h2>Welcome, {user?.email}</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="cards">
        <div className="card">
          <h3>Receipts</h3>
          <p className="card-count">{receiptsCount ?? '…'}</p>
        </div>
        <div className="card">
          <h3>Vouchers</h3>
          <p className="card-count">{vouchersCount ?? '…'}</p>
        </div>
      </div>
    </div>
  );
}
