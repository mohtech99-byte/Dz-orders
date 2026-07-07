import { z } from 'zod';

export const customerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(120),
  phone: z.string().trim().min(8, 'Phone must be at least 8 characters').max(20),
  altPhone: z.string().trim().max(20).optional().or(z.literal('')),
  wilayaId: z.coerce.number().int().positive(),
  communeId: z.coerce.number().int().positive(),
  address: z.string().trim().min(4, 'Address is required').max(250),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  isBlacklisted: z.boolean().optional().default(false)
});
