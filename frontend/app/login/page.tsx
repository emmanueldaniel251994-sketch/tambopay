'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      if (!response.ok) throw new Error('Unable to sign in. Check your details and try again.');
      window.location.assign('/account');
    } catch (error) { setError(error instanceof Error ? error.message : 'Login failed'); }
    finally { setBusy(false); }
  }
  return <main className="portal-shell"><form className="portal-card" onSubmit={submit}>
    <Link href="/">← TamboPay home</Link><h1>Welcome back</h1><p>Sign in to your personal TamboPay account.</p>
    <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required/>
    <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" minLength={12} required/>
    <button className="pay-button" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
    <p role="alert">{error}</p><p>New customer? <Link href="/register">Create an account</Link></p>
  </form></main>;
}
