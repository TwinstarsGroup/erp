'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  name: string;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { user: User | null }) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        gap: '16px',
      }}
    >
      <Image src="/logo.png" alt="Twinstars Logo" width={48} height={48} />
      <span style={{ fontSize: '18px', fontWeight: 'bold', flex: 1 }}>Twinstars ERP</span>
      {user ? (
        <>
          <nav style={{ display: 'flex', gap: '16px' }}>
            <Link href="/">Dashboard</Link>
            <Link href="/receipts">Receipts</Link>
            <Link href="/vouchers">Vouchers</Link>
          </nav>
          <span style={{ fontSize: '14px', color: '#666' }}>{user.email}</span>
          <a href={`${API_URL}/auth/logout`} style={{ color: '#e53e3e' }}>
            Logout
          </a>
        </>
      ) : (
        <a href={`${API_URL}/auth/google`}>Login with Google</a>
      )}
    </header>
  );
}
