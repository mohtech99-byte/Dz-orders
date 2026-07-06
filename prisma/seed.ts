import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const wilayas = [
    { id: 1, code: '01', nameFr: 'Adrar', nameAr: 'أدرار' },
    { id: 16, code: '16', nameFr: 'Alger', nameAr: 'الجزائر' },
    { id: 31, code: '31', nameFr: 'Oran', nameAr: 'وهران' }
  ];

  const communes = [
    { id: 1, wilayaId: 1, nameFr: 'Adrar', nameAr: 'أدرار' },
    { id: 2, wilayaId: 16, nameFr: 'Bab El Oued', nameAr: 'باب الوادي' },
    { id: 3, wilayaId: 31, nameFr: 'Oran', nameAr: 'وهران' }
  ];

  const deliveryCompanies = [
    { name: 'Yalidine', logoUrl: null, apiSupported: false },
    { name: 'ZR Express', logoUrl: null, apiSupported: false },
    { name: 'Maystro', logoUrl: null, apiSupported: false },
    { name: 'NOEST', logoUrl: null, apiSupported: false },
    { name: 'Own delivery', logoUrl: null, apiSupported: false }
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 1500,
      maxOrdersPerMonth: 500,
      maxUsers: 3,
      features: { orderManagement: true, customerManagement: true }
    },
    {
      id: 'growth',
      name: 'Growth',
      priceMonthly: 3500,
      maxOrdersPerMonth: 2000,
      maxUsers: 10,
      features: { orderManagement: true, customerManagement: true, stats: true }
    }
  ];

  await prisma.wilaya.createMany({ data: wilayas, skipDuplicates: true });
  await prisma.commune.createMany({ data: communes, skipDuplicates: true });
  await prisma.deliveryCompany.createMany({ data: deliveryCompanies, skipDuplicates: true });
  await prisma.plan.createMany({ data: plans, skipDuplicates: true });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
