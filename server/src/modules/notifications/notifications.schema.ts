import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    type: z.enum([
      'order_placed',
      'order_completed',
      'order_refunded',
      'new_review',
      'new_bid',
      'bid_accepted',
      'new_message',
      'project_approved',
      'project_rejected',
      'payout_processed',
      'system',
    ]),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    link: z.string().url().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const notificationQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    limit: z.string().optional().transform(val => parseInt(val || '20')),
    isRead: z.string().optional().transform(val => val === 'true'),
    type: z.string().optional(),
  }),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>['body'];
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>['query'];
