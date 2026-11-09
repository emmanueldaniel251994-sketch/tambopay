'use client';
import { useState } from 'react';
import { services, validateOrder, type ServiceId } from '../lib/catalog';

export default function Home() {
  const [service, setService] = useState<ServiceId>('airtime');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState('');
  const [invalid, setInvalid] = useState(false);
  const choose = (id: ServiceId) => {
    setService(id);
    setFeedback('');
    document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  function review(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateOrder(service, reference, amount);
    setInvalid(Boolean(error));
    setFeedback(error || `Demo only — ₦${Number(amount).toLocaleString('en-NG', {minimumFractionDigits:2,maximumFractionDigits:2})}. Checkout is not enabled; no charge was made.`);
  }
  return <div className="site-shell">
    <header className="topbar">
      <a className="brand" href="#home" aria-label="TamboPay home"><span className="brand-mark">T</span><span className="brand-name">Tambo<span>Pay</span><small>Airtime • Data • Bills & More</small></span></a>
      <nav aria-label="Main navigation" className="nav"><a href="#home">Home</a><a href="#services">Airtime</a><a href="#services">Data</a><a href="#services">Bills</a><a href="#services">Education</a><a href="#checkout">Quick Pay</a></nav>
      <a className="portal-nav-link" href="/login">Sign in</a><a className="portal-nav-link" href="/account">My account</a><a className="portal-nav-link" href="/support">Support</a><span className="demo-pill">DEMO PREVIEW</span>
    </header>
    <main id="home">
      <section className="hero-layout">
        <div className="hero">
          <div className="hero-copy"><span className="eyebrow">✦ EVERYDAY PAYMENTS, MADE EASY</span><h1>Pay Your Bills<br/>In <em>Seconds.</em></h1><p>Airtime, Data, Electricity, Cable TV, Education and other payments — all in one vibrant place.</p><a className="hero-link" href="#services">Explore Services <span aria-hidden="true">→</span></a></div>
          <div className="hero-art" aria-hidden="true"><div className="sun sun-a"/><div className="sun sun-b"/><div className="device"><b>✦ TamboPay</b><span className="device-check">✓</span><strong>Payment made<br/>simple.</strong><small>Fast • Easy • Convenient</small></div><span className="floating-label">⚡ Easy payments</span></div>
        </div>
        <aside className="quick-pay" id="checkout">
          <div className="section-top"><div><span className="kicker">START HERE</span><h2>Quick Pay</h2></div><span className="sparkle">✦</span></div>
          <div className="tabs" aria-label="Quick pay categories">{services.slice(0,3).map(item=><button key={item.id} type="button" aria-pressed={service===item.id} className={service===item.id?'selected':''} onClick={()=>setService(item.id)}>{item.label}</button>)}</div>
          <form onSubmit={review} noValidate>
            <label htmlFor="service">Service</label><select id="service" value={service} onChange={event=>setService(event.target.value as ServiceId)}>{services.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select>
            <label htmlFor="reference">Phone, meter or customer reference</label><input id="reference" value={reference} onChange={event=>setReference(event.target.value)} maxLength={60} placeholder="e.g. 08012345678" autoComplete="off"/>
            <label htmlFor="amount">Amount (₦)</label><input id="amount" type="number" min="100" max="1000000" step=".01" value={amount} onChange={event=>setAmount(event.target.value)} placeholder="1000"/>
            <button className="pay-button" type="submit">Review Payment →</button>
            <p className={invalid?'feedback error':'feedback'} role="status" aria-live="polite">{feedback}</p>
          </form><p className="demo-note">Sandbox UI only. No live transactions or wallet.</p>
        </aside>
      </section>
      <section className="services-section" id="services"><div className="section-top"><div><span className="kicker">ONE APP, EVERYDAY ESSENTIALS</span><h2>Our Services</h2></div><span className="services-caption">Simple, convenient bill payments</span></div>
        <div className="service-grid">{services.map(item=><button className="service-card" key={item.id} onClick={()=>choose(item.id)}><span className="service-icon">{item.icon}</span><strong>{item.label}</strong><small>{item.detail}</small><span className="card-arrow" aria-hidden="true">↗</span></button>)}</div>
      </section>
      <section className="trust-strip"><div><b>✓</b><span><strong>Everyday essentials</strong><small>Six categories in one place</small></span></div><div><b>↗</b><span><strong>Direct checkout</strong><small>No stored-value wallet</small></span></div><div><b>◎</b><span><strong>Prototype environment</strong><small>Payments not yet enabled</small></span></div></section>
    </main>
    <footer><span>✦ <strong>TamboPay</strong></span><span>Phase 1 prototype • No live transactions</span></footer>
  </div>;
}
