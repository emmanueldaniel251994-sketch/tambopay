import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '../../../lib/server-api';

const cookieName = 'tambopay_session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const upstream = await backendFetch('/api/v1/customers/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
    if (!upstream.ok) return NextResponse.json({ error: 'Invalid credentials or login unavailable' }, { status: upstream.status === 401 ? 401 : 503 });
    const data = await upstream.json();
    if (typeof data.access_token !== 'string') return NextResponse.json({ error: 'Invalid backend response' }, { status: 502 });
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(cookieName, data.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/', maxAge: Math.min(Number(data.expires_in) || 86400, 86400),
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Login service unavailable' }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  if (token) {
    try {
      await backendFetch('/api/v1/customers/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } catch { /* Delete local cookie even if upstream is down. */ }
  }
  const response = NextResponse.json({ authenticated: false });
  response.cookies.delete(cookieName);
  return response;
}
