'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { user: User | null }) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <h1>Twinstars ERP</h1>
        <p style={{ marginTop: '16px', color: '#666' }}>Please login to continue.</p>
        <a
          href={`${API_URL}/auth/google`}
          style={{
            display: 'inline-block',
            marginTop: '24px',
            padding: '12px 24px',
            background: '#4285f4',
            color: '#fff',
            borderRadius: '4px',
          }}
        >
          Login with Google
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p style={{ color: '#666', marginTop: '8px' }}>
        Logged in as {user.email}
      </p>
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <a
          href="/receipts"
          style={{
            padding: '16px 32px',
            background: '#0070f3',
            color: '#fff',
            borderRadius: '4px',
          }}
        >
          Receipts
        </a>
        <a
          href="/vouchers"
          style={{
            padding: '16px 32px',
            background: '#0070f3',
            color: '#fff',
            borderRadius: '4px',
          }}
        >
          Vouchers
        </a>
      </div>
    </div>
  );
}
