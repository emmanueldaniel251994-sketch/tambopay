'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';

type Entry = { role: 'customer' | 'assistant'; text: string };
export default function SupportPage() {
  const [messages, setMessages] = useState<Entry[]>([{ role: 'assistant', text: 'Welcome to TamboPay support. I can explain services and direct checkout, but I cannot verify payments.' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput(''); setBusy(true);
    setMessages(old => [...old, { role: 'customer', text: message }]);
    try {
      const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
      if (!response.ok) throw new Error('Support is temporarily unavailable.');
      const data = await response.json();
      setMessages(old => [...old, { role: 'assistant', text: String(data.answer) }]);
    } catch {
      setMessages(old => [...old, { role: 'assistant', text: 'Support is temporarily unavailable. Please try again later.' }]);
    } finally { setBusy(false); }
  }
  return <main className="portal-shell"><section className="portal-card">
    <Link href="/">← TamboPay home</Link><h1>Support assistant</h1>
    <p>Automated FAQ support, not generative AI yet. Never share passwords, card numbers or payment PINs.</p>
    <div className="chat-history" aria-live="polite">{messages.map((entry, index) => <p key={index}><strong>{entry.role === 'customer' ? 'You' : 'TamboPay'}:</strong> {entry.text}</p>)}</div>
    <form onSubmit={send}><label htmlFor="message">Your question</label><input id="message" value={input} maxLength={500} onChange={event => setInput(event.target.value)} required/>
      <button className="pay-button" disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button></form>
  </section></main>;
}
