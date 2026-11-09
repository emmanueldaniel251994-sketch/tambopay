import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '../../../lib/server-api';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('tambopay_session')?.value;
  if (!token) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const [profile, orders] = await Promise.all([
      backendFetch('/api/v1/customers/me', { headers }),
      backendFetch('/api/v1/customers/me/orders', { headers }),
    ]);
    if (!profile.ok || !orders.ok) return NextResponse.json({ error: 'Session expired or account unavailable' }, { status: profile.status === 401 ? 401 : 503 });
    return NextResponse.json({ profile: await profile.json(), orders: await orders.json() });
  } catch {
    return NextResponse.json({ error: 'Account service unavailable' }, { status: 503 });
  }
}
