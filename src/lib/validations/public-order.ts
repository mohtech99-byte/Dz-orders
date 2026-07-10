import { z } from 'zod';

export const publicOrderItemSchema = z.object({
  productId: z.string().trim().min(1, 'Select a product'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1').max(50, 'Quantity is too high')
});

export const publicOrderSchema = z.object({
  fullName: z.string().trim().min(2, 'Your full name is required').max(120),
  phone: z.string().trim().min(8, 'A valid phone number is required').max(20),
  wilayaId: z.coerce.number().int().positive('Select your wilaya'),
  communeId: z.coerce.number().int().positive('Select your commune'),
  address: z.string().trim().min(4, 'Your address is required').max(300),
  notes: z.string().trim().max(300).optional().or(z.literal('')),
  // Honeypot: a real visitor never fills this hidden field. Bots often do.
  website: z.string().max(0).optional().or(z.literal('')),
  items: z.array(publicOrderItemSchema).min(1, 'Select at least one product')
});

export type PublicOrderInput = z.infer<typeof publicOrderSchema>;
