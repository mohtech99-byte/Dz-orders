import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

async function getOrganizationId() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, status: 'ACTIVE' },
    select: { organizationId: true },
    orderBy: { createdAt: 'asc' }
  });

  if (!membership?.organizationId) {
    throw new Error('Organization not found');
  }

  return membership.organizationId;
}

export async function getOwnOrganization() {
  const organizationId = await getOrganizationId();
  return prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    include: { wilaya: true, commune: true }
  });
}

export async function updateOrganizationOrigin(input: { wilayaId: number; communeId: number }) {
  const organizationId = await getOrganizationId();
  return prisma.organization.update({
    where: { id: organizationId },
    data: { wilayaId: input.wilayaId, communeId: input.communeId }
  });
}
