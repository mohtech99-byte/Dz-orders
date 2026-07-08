import { randomBytes } from 'crypto';
import { hash, compare } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

function normalizeSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

function buildBaseUrl() {
  return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
}

function generateToken() {
  return randomBytes(32).toString('hex');
}

async function createToken(email: string, purpose: 'verification' | 'reset') {
  const token = generateToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.verificationToken.create({
    data: {
      identifier: `${purpose}:${email}`,
      token,
      expires
    }
  });

  return token;
}

export async function createUser(name: string, email: string, password: string) {
  const passwordHash = await hash(password, 10);
  const organizationName = `${name.split(' ')[0]}'s Store`;
  const slug = `${normalizeSlug(organizationName)}-${Date.now()}`;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        emailVerified: true
      }
    });

    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        slug
      }
    });

    await tx.membership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date()
      }
    });

   // Email verification disabled during development

    return user;
  });
}

export async function verifyEmailToken(token: string) {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return { success: false, reason: 'invalid' as const };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return { success: false, reason: 'expired' as const };
  }

  const [purpose, email] = record.identifier.split(':');

  if (purpose !== 'verification') {
    return { success: false, reason: 'invalid' as const };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, reason: 'missing-user' as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    await tx.verificationToken.delete({ where: { token } });
  });

  return { success: true };
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: true };
  }

  const token = await createToken(email, 'reset');
  const resetUrl = `${buildBaseUrl()}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your DZ Orders password',
    html: `<p>Hello ${user.name},</p><p>Reset your password by clicking <a href="${resetUrl}">here</a>.</p>`,
    text: `Hello ${user.name}, reset your password by visiting ${resetUrl}`
  });

  return { success: true };
}

export async function resetPassword(token: string, password: string) {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return { success: false, reason: 'invalid' as const };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return { success: false, reason: 'expired' as const };
  }

  const [purpose, email] = record.identifier.split(':');

  if (purpose !== 'reset') {
    return { success: false, reason: 'invalid' as const };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, reason: 'missing-user' as const };
  }

  const passwordHash = await hash(password, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
    await tx.verificationToken.delete({ where: { token } });
  });

  return { success: true };
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  const isValid = await compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  if (!user.emailVerified) {
    return { user, requiresVerification: true };
  }

  return { user, requiresVerification: false };
}
