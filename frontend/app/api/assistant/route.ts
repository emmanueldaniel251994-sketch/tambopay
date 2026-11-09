import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '../../../lib/server-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.message !== 'string' || body.message.length < 1 || body.message.length > 500) {
      return NextResponse.json({ error: 'Message must contain 1–500 characters' }, { status: 400 });
    }
    const upstream = await backendFetch('/api/v1/assistant/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: body.message }),
    });
    if (!upstream.ok) return NextResponse.json({ error: 'Assistant unavailable' }, { status: 503 });
    return NextResponse.json(await upstream.json());
  } catch {
    return NextResponse.json({ error: 'Assistant unavailable' }, { status: 503 });
  }
}
