import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getProviderForCompany } from './delivery/registry';

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

export async function listDeliveryCompanyCredentials() {
  const organizationId = await getOrganizationId();

  const companies = await prisma.deliveryCompany.findMany({ orderBy: { name: 'asc' } });
  const credentials = await prisma.deliveryCompanyCredential.findMany({ where: { organizationId } });
  const credentialByCompany = new Map(credentials.map((credential) => [credential.deliveryCompanyId, credential]));

  return companies.map((company) => ({
    company,
    credential: credentialByCompany.get(company.id) ?? null,
    hasProvider: getProviderForCompany(company.name) !== null
  }));
}

export async function saveDeliveryCompanyCredential(deliveryCompanyId: string, input: { apiId: string; apiToken: string }) {
  const organizationId = await getOrganizationId();

  return prisma.deliveryCompanyCredential.upsert({
    where: { organizationId_deliveryCompanyId: { organizationId, deliveryCompanyId } },
    update: { apiId: input.apiId, apiToken: input.apiToken, lastTestedAt: null, lastTestOk: null },
    create: { organizationId, deliveryCompanyId, apiId: input.apiId, apiToken: input.apiToken }
  });
}

export async function testDeliveryCompanyCredential(deliveryCompanyId: string) {
  const organizationId = await getOrganizationId();

  const credential = await prisma.deliveryCompanyCredential.findFirst({
    where: { organizationId, deliveryCompanyId },
    include: { deliveryCompany: true }
  });

  if (!credential?.apiId || !credential.apiToken) {
    throw new Error('Enter an API ID and token first.');
  }

  const provider = getProviderForCompany(credential.deliveryCompany.name);

  if (!provider) {
    throw new Error('This delivery company does not have an API integration yet.');
  }

  const ok = await provider.testConnection({ apiId: credential.apiId, apiToken: credential.apiToken });

  await prisma.deliveryCompanyCredential.update({
    where: { id: credential.id },
    data: { lastTestedAt: new Date(), lastTestOk: ok }
  });

  return ok;
}
