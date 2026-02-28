import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { ApiResponse, Category } from '@/types';

export interface CategoryFormData {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  parentId?: string;
}

export const categoriesService = {
  // Get all categories (with hierarchy)
  getAll: () =>
    apiGet<ApiResponse<Category[]>>('/categories'),

  // Get category tree (nested structure)
  getTree: () =>
    apiGet<ApiResponse<Category[]>>('/categories/tree'),

  // Get single category by slug
  getBySlug: (slug: string) =>
    apiGet<ApiResponse<Category>>(`/categories/${slug}`),

  // Get category by ID
  getById: (id: string) =>
    apiGet<ApiResponse<Category>>(`/categories/id/${id}`),

  // Admin: Create category
  create: (data: CategoryFormData) =>
    apiPost<ApiResponse<Category>>('/admin/categories', data),

  // Admin: Update category
  update: (id: string, data: Partial<CategoryFormData>) =>
    apiPut<ApiResponse<Category>>(`/admin/categories/${id}`, data),

  // Admin: Delete category
  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/admin/categories/${id}`),

  // Get popular categories (based on project count)
  getPopular: (limit = 8) =>
    apiGet<ApiResponse<Category[]>>('/categories/popular', { limit }),
};
