import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  categoryId: z.string().trim().optional().or(z.literal('')),
  price: z.coerce.number().int().nonnegative('Price must be zero or more'),
  cost: z.coerce.number().int().nonnegative('Cost must be zero or more').optional().or(z.literal('')),
  sku: z.string().trim().max(80).optional().or(z.literal('')),
  barcode: z.string().trim().max(80).optional().or(z.literal('')),
  stock: z.coerce.number().int().nonnegative('Stock must be zero or more'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  imageUrls: z.array(z.string().url()).optional().default([])
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(80)
});
