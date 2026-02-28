import { apiGet, apiPost } from './api';
import type { ApiResponse, Order, PaginationMeta } from '@/types';

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreateOrderData {
  projectId: string;
}

export const ordersService = {
  // Get my orders as buyer
  getMyPurchases: (filters: OrderFilters = {}) =>
    apiGet<ApiResponse<Order[]> & { meta: { pagination: PaginationMeta } }>('/orders/purchases', filters),

  // Get my orders as seller
  getMySales: (filters: OrderFilters = {}) =>
    apiGet<ApiResponse<Order[]> & { meta: { pagination: PaginationMeta } }>('/orders/sales', filters),

  // Get single order
  getById: (id: string) =>
    apiGet<ApiResponse<Order>>(`/orders/${id}`),

  // Create payment intent for order
  createPaymentIntent: (data: CreateOrderData) =>
    apiPost<ApiResponse<{ clientSecret: string; orderId: string }>>('/orders/create-payment-intent', data),

  // Confirm order after successful payment
  confirmPayment: (orderId: string, paymentIntentId: string) =>
    apiPost<ApiResponse<Order>>(`/orders/${orderId}/confirm`, { paymentIntentId }),

  // Download project files
  download: (orderId: string) =>
    apiGet<ApiResponse<{ downloadUrl: string }>>(`/orders/${orderId}/download`),

  // Request refund
  requestRefund: (orderId: string, reason: string) =>
    apiPost<ApiResponse<Order>>(`/orders/${orderId}/refund`, { reason }),

  // Admin: Get all orders
  getAll: (filters: OrderFilters = {}) =>
    apiGet<ApiResponse<Order[]> & { meta: { pagination: PaginationMeta } }>('/admin/orders', filters),

  // Admin: Process refund
  processRefund: (orderId: string) =>
    apiPost<ApiResponse<Order>>(`/admin/orders/${orderId}/process-refund`),
};
