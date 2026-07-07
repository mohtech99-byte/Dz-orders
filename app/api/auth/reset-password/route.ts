import { NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { resetPassword } from '@/server/services/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const result = resetPasswordSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Please provide a valid password.' }, { status: 400 });
  }

  const response = await resetPassword(result.data.token, result.data.password);

  if (!response.success) {
    return NextResponse.json({ success: false, message: 'This reset link is invalid or has expired.' }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Password updated successfully.' });
}
