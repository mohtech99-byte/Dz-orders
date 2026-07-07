import { NextResponse } from 'next/server';
import { verifyEmailToken } from '@/server/services/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, message: 'Missing verification token.' }, { status: 400 });
  }

  const result = await verifyEmailToken(token);

  if (!result.success) {
    return NextResponse.json({ success: false, message: 'This verification link is invalid or has expired.' }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Email verified successfully.' });
}
