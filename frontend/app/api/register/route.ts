import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '../../../lib/server-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const upstream = await backendFetch('/api/v1/customers/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
    if (!upstream.ok) return NextResponse.json({ error: upstream.status === 409 ? 'Account already exists' : 'Registration unavailable or invalid' }, { status: upstream.status === 409 ? 409 : 503 });
    return NextResponse.json({ registered: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Registration service unavailable' }, { status: 503 });
  }
}
