'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Order = { id: string; reference: string; service: string; amount_kobo: number; status: string };
type Account = { profile: { id: string; email: string }; orders: Order[] };

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [message, setMessage] = useState('Loading your account...');
  useEffect(() => {
    fetch('/api/account', { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('Please sign in to view your account.');
      setAccount(await response.json());
    }).catch(error => setMessage(error.message));
  }, []);
  async function logout() {
    await fetch('/api/session', { method: 'DELETE' });
    window.location.assign('/login');
  }
  return <main className="portal-shell">
    <div className="portal-card">
      <Link href="/">← TamboPay home</Link>
      <h1>My account</h1>
      {!account ? <p role="status">{message} <Link href="/login">Sign in</Link></p> : <>
        <p>Signed in as <strong>{account.profile.email}</strong></p>
        <button className="pay-button" onClick={logout}>Sign out</button>
        <h2>My transactions</h2>
        {account.orders.length === 0 ? <p>No transactions yet.</p> : <ul>{account.orders.map(order =>
          <li key={order.id}><strong>{order.service}</strong> — ₦{(order.amount_kobo / 100).toLocaleString('en-NG')} — {order.status} <small>{order.reference}</small></li>
        )}</ul>}
      </>}
    </div>
  </main>;
}
