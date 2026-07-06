import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';

function normalizeSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
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
        emailVerified: false
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

    return user;
  });
}
