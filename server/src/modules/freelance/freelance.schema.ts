import { z } from 'zod';

export const createCustomRequestSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
    categoryId: z.string().uuid('Invalid category ID'),
    budget: z.number().min(10, 'Budget must be at least $10'),
    deadline: z.string().datetime().optional(),
    requirements: z.array(z.string()).optional(),
    attachments: z.array(z.string().url()).optional(),
  }),
});

export const updateCustomRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid request ID'),
  }),
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(50).max(5000).optional(),
    budget: z.number().min(10).optional(),
    deadline: z.string().datetime().optional(),
    requirements: z.array(z.string()).optional(),
    status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
  }),
});

export const createBidSchema = z.object({
  body: z.object({
    requestId: z.string().uuid('Invalid request ID'),
    amount: z.number().min(10, 'Bid must be at least $10'),
    deliveryDays: z.number().int().min(1, 'Delivery time must be at least 1 day'),
    proposal: z.string().min(50, 'Proposal must be at least 50 characters').max(3000),
  }),
});

export const updateBidSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bid ID'),
  }),
  body: z.object({
    amount: z.number().min(10).optional(),
    deliveryDays: z.number().int().min(1).optional(),
    proposal: z.string().min(50).max(3000).optional(),
  }),
});

export const createMilestoneSchema = z.object({
  body: z.object({
    requestId: z.string().uuid('Invalid request ID'),
    title: z.string().min(5).max(200),
    description: z.string().max(1000).optional(),
    amount: z.number().min(1),
    dueDate: z.string().datetime().optional(),
  }),
});

export const customRequestQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    limit: z.string().optional().transform(val => parseInt(val || '10')),
    categoryId: z.string().uuid().optional(),
    status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
    minBudget: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxBudget: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    sort: z.enum(['createdAt', 'budget', 'deadline']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateCustomRequestInput = z.infer<typeof createCustomRequestSchema>['body'];
export type UpdateCustomRequestInput = z.infer<typeof updateCustomRequestSchema>['body'];
export type CreateBidInput = z.infer<typeof createBidSchema>['body'];
export type UpdateBidInput = z.infer<typeof updateBidSchema>['body'];
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>['body'];
export type CustomRequestQueryInput = z.infer<typeof customRequestQuerySchema>['query'];
