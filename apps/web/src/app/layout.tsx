import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Twinstars ERP',
  description: 'ERP System for Twinstars Group',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ padding: '24px' }}>{children}</main>
      </body>
    </html>
  );
}
