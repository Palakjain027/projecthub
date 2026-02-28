import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './api';
import type { ApiResponse, Project, PaginationMeta } from '@/types';

export interface ProjectFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  techStack?: string[];
  rating?: number;
  isFree?: boolean;
  status?: string;
  sortBy?: 'createdAt' | 'price' | 'averageRating' | 'downloadsCount' | 'viewsCount';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectFormData {
  title: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  tags?: string[];
  price: number;
  isFree?: boolean;
  techStack?: string[];
  features?: string[];
  sourceCodeUrl?: string;
  documentationUrl?: string;
  livePreviewUrl?: string;
}

export const projectsService = {
  // Get all approved projects (public)
  getAll: (filters: ProjectFilters = {}) =>
    apiGet<ApiResponse<Project[]> & { meta: { pagination: PaginationMeta } }>('/projects', filters),

  // Get single project by slug (public)
  getBySlug: (slug: string) =>
    apiGet<ApiResponse<Project>>(`/projects/${slug}`),

  // Get featured projects (public)
  getFeatured: (limit = 6) =>
    apiGet<ApiResponse<Project[]>>('/projects/featured', { limit }),

  // Get my projects (seller)
  getMyProjects: (filters: ProjectFilters = {}) =>
    apiGet<ApiResponse<Project[]> & { meta: { pagination: PaginationMeta } }>('/projects/my', filters),

  // Get single project by ID (owner only)
  getById: (id: string) =>
    apiGet<ApiResponse<Project>>(`/projects/id/${id}`),

  // Create project
  create: (data: ProjectFormData) =>
    apiPost<ApiResponse<Project>>('/projects', data),

  // Update project
  update: (id: string, data: Partial<ProjectFormData>) =>
    apiPut<ApiResponse<Project>>(`/projects/${id}`, data),

  // Delete project
  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/projects/${id}`),

  // Submit for review
  submitForReview: (id: string) =>
    apiPost<ApiResponse<Project>>(`/projects/${id}/submit`),

  // Upload project files
  uploadThumbnail: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return apiUpload<ApiResponse<{ url: string }>>(`/projects/${id}/thumbnail`, formData);
  },

  uploadDemoVideo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    return apiUpload<ApiResponse<{ url: string }>>(`/projects/${id}/demo-video`, formData);
  },

  uploadSourceCode: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('sourceCode', file);
    return apiUpload<ApiResponse<{ url: string }>>(`/projects/${id}/source-code`, formData);
  },

  uploadDocumentation: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('documentation', file);
    return apiUpload<ApiResponse<{ url: string }>>(`/projects/${id}/documentation`, formData);
  },

  // Get projects by category
  getByCategory: (categorySlug: string, filters: ProjectFilters = {}) =>
    apiGet<ApiResponse<Project[]> & { meta: { pagination: PaginationMeta } }>(
      `/projects/category/${categorySlug}`,
      filters
    ),

  // Search projects
  search: (query: string, filters: ProjectFilters = {}) =>
    apiGet<ApiResponse<Project[]> & { meta: { pagination: PaginationMeta } }>('/projects/search', {
      q: query,
      ...filters,
    }),

  // Get related projects
  getRelated: (projectId: string, limit = 4) =>
    apiGet<ApiResponse<Project[]>>(`/projects/${projectId}/related`, { limit }),

  // Increment view count
  incrementView: (projectId: string) =>
    apiPost<ApiResponse<null>>(`/projects/${projectId}/view`),

  // Admin: Get pending projects
  getPending: (filters: ProjectFilters = {}) =>
    apiGet<ApiResponse<Project[]> & { meta: { pagination: PaginationMeta } }>('/admin/projects/pending', filters),

  // Admin: Approve project
  approve: (id: string) =>
    apiPost<ApiResponse<Project>>(`/admin/projects/${id}/approve`),

  // Admin: Reject project
  reject: (id: string, reason: string) =>
    apiPost<ApiResponse<Project>>(`/admin/projects/${id}/reject`, { reason }),

  // Admin: Feature/unfeature project
  toggleFeatured: (id: string) =>
    apiPost<ApiResponse<Project>>(`/admin/projects/${id}/toggle-featured`),
};
