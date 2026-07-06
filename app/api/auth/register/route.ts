import { NextResponse } from 'next/server';
import { createUser } from '@/server/services/auth';
import { registerSchema } from '@/lib/validations/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();

  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { name, email, password } = result.data;
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  await createUser(name, email, password);
  return NextResponse.json({ ok: true });
}
