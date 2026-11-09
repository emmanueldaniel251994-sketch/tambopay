'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password'));
    if (password !== form.get('confirm')) { setMessage('Passwords do not match.'); setBusy(false); return; }
    try {
      const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password }) });
      if (!response.ok) throw new Error('Registration failed. This email may already be registered.');
      window.location.assign('/login');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Registration failed'); }
    finally { setBusy(false); }
  }
  return <main className="portal-shell"><form className="portal-card" onSubmit={submit}>
    <Link href="/">← TamboPay home</Link><h1>Create your account</h1>
    <p>Use your own email address and a strong password. Email verification is not yet enabled in this staging build.</p>
    <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required/>
    <label htmlFor="password">Password (12+ characters)</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required/>
    <label htmlFor="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required/>
    <button className="pay-button" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
    <p role="alert">{message}</p><p>Already registered? <Link href="/login">Sign in</Link></p>
  </form></main>;
}
