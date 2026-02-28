import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid project ID'),
    licenseType: z.enum(['single', 'extended', 'unlimited']).default('single'),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    status: z.enum(['pending', 'completed', 'refunded', 'disputed']),
  }),
});

export const requestRefundSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
  }),
});

export const orderQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    limit: z.string().optional().transform(val => parseInt(val || '10')),
    status: z.enum(['pending', 'completed', 'refunded', 'disputed']).optional(),
    sort: z.enum(['createdAt', 'amount']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
export type RequestRefundInput = z.infer<typeof requestRefundSchema>['body'];
export type OrderQueryInput = z.infer<typeof orderQuerySchema>['query'];
