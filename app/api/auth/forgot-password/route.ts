import { NextResponse } from 'next/server';
import { requestPasswordReset } from '@/server/services/auth';
import { forgotPasswordSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const result = forgotPasswordSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  await requestPasswordReset(result.data.email);
  return NextResponse.json({ ok: true, message: 'If that email exists, we sent reset instructions.' });
}
