import { apiPost, apiGet } from './api';
import type { 
  ApiResponse, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  User 
} from '@/types';

export const authService = {
  // Login
  login: (credentials: LoginCredentials) =>
    apiPost<ApiResponse<AuthResponse>>('/auth/login', credentials),

  // Register
  register: (data: RegisterData) =>
    apiPost<ApiResponse<AuthResponse>>('/auth/register', data),

  // Logout
  logout: () =>
    apiPost<ApiResponse<null>>('/auth/logout'),

  // Refresh token
  refresh: () =>
    apiPost<ApiResponse<AuthResponse>>('/auth/refresh'),

  // Get current user
  me: () =>
    apiGet<ApiResponse<User>>('/auth/me'),

  // Request password reset
  forgotPassword: (email: string) =>
    apiPost<ApiResponse<null>>('/auth/forgot-password', { email }),

  // Reset password with token
  resetPassword: (token: string, password: string) =>
    apiPost<ApiResponse<null>>('/auth/reset-password', { token, password }),

  // Verify email
  verifyEmail: (token: string) =>
    apiGet<ApiResponse<null>>(`/auth/verify-email/${token}`),

  // Resend verification email
  resendVerification: (email: string) =>
    apiPost<ApiResponse<null>>('/auth/resend-verification', { email }),

  // Change password (authenticated)
  changePassword: (currentPassword: string, newPassword: string) =>
    apiPost<ApiResponse<null>>('/auth/change-password', {
      currentPassword,
      newPassword,
    }),
};
