import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { ApiResponse, Review, PaginationMeta } from '@/types';

export interface ReviewFilters {
  page?: number;
  limit?: number;
  rating?: number;
}

export interface CreateReviewData {
  projectId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export const reviewsService = {
  // Get reviews for a project (public)
  getByProject: (projectId: string, filters: ReviewFilters = {}) =>
    apiGet<ApiResponse<Review[]> & { meta: { pagination: PaginationMeta } }>(
      `/reviews/project/${projectId}`,
      filters
    ),

  // Get reviews for a seller (public)
  getBySeller: (sellerId: string, filters: ReviewFilters = {}) =>
    apiGet<ApiResponse<Review[]> & { meta: { pagination: PaginationMeta } }>(
      `/reviews/seller/${sellerId}`,
      filters
    ),

  // Get my reviews (as reviewer)
  getMyReviews: (filters: ReviewFilters = {}) =>
    apiGet<ApiResponse<Review[]> & { meta: { pagination: PaginationMeta } }>('/reviews/my', filters),

  // Get reviews I received (as seller)
  getReceivedReviews: (filters: ReviewFilters = {}) =>
    apiGet<ApiResponse<Review[]> & { meta: { pagination: PaginationMeta } }>('/reviews/received', filters),

  // Create review
  create: (data: CreateReviewData) =>
    apiPost<ApiResponse<Review>>('/reviews', data),

  // Update review
  update: (id: string, data: UpdateReviewData) =>
    apiPut<ApiResponse<Review>>(`/reviews/${id}`, data),

  // Delete review
  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/reviews/${id}`),

  // Check if user can review a project
  canReview: (projectId: string) =>
    apiGet<ApiResponse<{ canReview: boolean; hasReviewed: boolean }>>(`/reviews/can-review/${projectId}`),

  // Get review statistics for a project
  getStats: (projectId: string) =>
    apiGet<ApiResponse<{
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<number, number>;
    }>>(`/reviews/stats/${projectId}`),
};
