import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const adminUpdateUserSchema = z.object({
  fullName: z.string().optional(),
  bio: z.string().optional(),
  role: z.enum([
    'super_admin',
    'admin',
    'seller',
    'buyer',
    'freelancer',
    'free_user',
    'paid_user',
  ] as const).optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isBanned: z.boolean().optional(),
});

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

export const userQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: z.string().optional(),
  isVerified: z.string().optional(),
  isActive: z.string().optional(),
  isBanned: z.string().optional(),
  sort: z.string().optional(),
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const banUserSchema = z.object({
  reason: z.string().min(10, 'Ban reason must be at least 10 characters').optional(),
});

export type BanUserInput = z.infer<typeof banUserSchema>;
