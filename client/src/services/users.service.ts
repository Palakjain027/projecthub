import { apiGet, apiPut, apiUpload } from './api';
import type { ApiResponse, User, PaginationMeta, Earning } from '@/types';

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  username?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isVerified?: boolean;
  isActive?: boolean;
  isBanned?: boolean;
}

export const usersService = {
  // Get user profile by username (public)
  getByUsername: (username: string) =>
    apiGet<ApiResponse<User>>(`/users/profile/${username}`),

  // Get current user profile
  getMe: () =>
    apiGet<ApiResponse<User>>('/users/me'),

  // Update current user profile
  updateMe: (data: UpdateProfileData) =>
    apiPut<ApiResponse<User>>('/users/me', data),

  // Upload avatar
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiUpload<ApiResponse<{ avatarUrl: string }>>('/users/me/avatar', formData);
  },

  // Get my earnings (seller)
  getMyEarnings: (filters: { page?: number; limit?: number; status?: string } = {}) =>
    apiGet<ApiResponse<Earning[]> & { meta: { pagination: PaginationMeta } }>('/users/me/earnings', filters),

  // Get earnings summary (seller)
  getEarningsSummary: () =>
    apiGet<ApiResponse<{
      totalEarnings: number;
      pendingEarnings: number;
      paidEarnings: number;
      thisMonthEarnings: number;
    }>>('/users/me/earnings/summary'),

  // Request payout (seller)
  requestPayout: () =>
    apiGet<ApiResponse<{ message: string }>>('/users/me/request-payout'),

  // Admin: Get all users
  getAll: (filters: UserFilters = {}) =>
    apiGet<ApiResponse<User[]> & { meta: { pagination: PaginationMeta } }>('/admin/users', filters),

  // Admin: Get user by ID
  getById: (id: string) =>
    apiGet<ApiResponse<User>>(`/admin/users/${id}`),

  // Admin: Ban user
  ban: (id: string, reason?: string) =>
    apiPut<ApiResponse<User>>(`/admin/users/${id}/ban`, { reason }),

  // Admin: Unban user
  unban: (id: string) =>
    apiPut<ApiResponse<User>>(`/admin/users/${id}/unban`),

  // Admin: Verify user
  verify: (id: string) =>
    apiPut<ApiResponse<User>>(`/admin/users/${id}/verify`),

  // Admin: Update user role
  updateRole: (id: string, role: string) =>
    apiPut<ApiResponse<User>>(`/admin/users/${id}/role`, { role }),
};
