import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid project ID'),
    orderId: z.string().uuid('Invalid order ID').optional(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(10).max(2000).optional(),
  }),
});

export const replyToReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    reply: z.string().min(10, 'Reply must be at least 10 characters').max(1000),
  }),
});

export const reviewQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    limit: z.string().optional().transform(val => parseInt(val || '10')),
    projectId: z.string().uuid().optional(),
    rating: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    sort: z.enum(['createdAt', 'rating', 'helpful']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
export type ReplyToReviewInput = z.infer<typeof replyToReviewSchema>['body'];
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>['query'];
