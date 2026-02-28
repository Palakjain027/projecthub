import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  shortDescription: z
    .string()
    .max(300, 'Short description must be less than 300 characters')
    .optional(),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  price: z.coerce
    .number()
    .min(0, 'Price cannot be negative')
    .max(9999.99, 'Price cannot exceed $9,999.99'),
  isFree: z.boolean().optional(),
  techStack: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  livePreviewUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  isFree: z.string().optional(),
  rating: z.string().optional(),
  status: z.string().optional(),
  sellerId: z.string().optional(),
  featured: z.string().optional(),
  sort: z.string().optional(),
});

export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

export const projectIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});

export const projectSlugParamSchema = z.object({
  slug: z.string().min(1, 'Project slug is required'),
});

export const approveProjectSchema = z.object({
  // No additional fields needed
});

export const rejectProjectSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export type RejectProjectInput = z.infer<typeof rejectProjectSchema>;
