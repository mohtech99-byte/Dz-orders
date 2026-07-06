import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
