import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().trim().min(1, 'Select at least one product'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1')
});

export const orderSchema = z.object({
  customerId: z.string().trim().min(1, 'Customer is required'),
  phoneSnapshot: z.string().trim().min(4, 'Phone number is required'),
  wilayaId: z.coerce.number().int().positive('Select a wilaya'),
  communeId: z.coerce.number().int().positive('Select a commune'),
  addressSnapshot: z.string().trim().min(4, 'Address is required'),
  deliveryCompanyId: z.string().trim().optional().or(z.literal('')),
  deliveryType: z.enum(['HOME', 'STOP_DESK']).default('HOME'),
  deliveryCost: z.coerce.number().int().nonnegative('Delivery cost must be zero or more'),
  discount: z.coerce.number().int().nonnegative('Discount must be zero or more'),
  paymentMethod: z.enum(['COD', 'PREPAID']).default('COD'),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  status: z.enum(['NEW', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']).default('NEW'),
  source: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP', 'MANUAL', 'PUBLIC_FORM']).default('MANUAL'),
  items: z.array(orderItemSchema).min(1, 'Add at least one product to the order')
});
