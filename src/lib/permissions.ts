import { MembershipRole } from '@prisma/client';

export const canAccessDashboard = (role?: MembershipRole) => {
  return role !== undefined;
};
