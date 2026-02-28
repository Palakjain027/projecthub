import { Request, Response } from 'express';
import { ordersService } from './orders.service';
import { ApiResponse } from '@/utils/ApiResponse';
import type { CreateOrderInput, OrderQueryInput, UpdateOrderStatusInput, RequestRefundInput } from './orders.schema';

export const ordersController = {
  async create(req: Request, res: Response) {
    const data = req.body as CreateOrderInput;
    const order = await ordersService.create(req.user!.id, data);
    res.status(201).json(new ApiResponse(201, order, 'Order created successfully'));
  },

  async getById(req: Request, res: Response) {
    const order = await ordersService.getById(req.params.id, req.user?.id);
    res.json(new ApiResponse(200, order));
  },

  async getMyPurchases(req: Request, res: Response) {
    const query = req.query as unknown as OrderQueryInput;
    const result = await ordersService.getMyPurchases(req.user!.id, query);
    res.json(new ApiResponse(200, result.data, 'Purchases retrieved', { pagination: result.pagination }));
  },

  async getMySales(req: Request, res: Response) {
    const query = req.query as unknown as OrderQueryInput;
    const result = await ordersService.getMySales(req.user!.id, query);
    res.json(new ApiResponse(200, result.data, 'Sales retrieved', { pagination: result.pagination }));
  },

  async complete(req: Request, res: Response) {
    const { stripePaymentId } = req.body;
    const order = await ordersService.completeOrder(req.params.id, stripePaymentId);
    res.json(new ApiResponse(200, order, 'Order completed successfully'));
  },

  async requestRefund(req: Request, res: Response) {
    const data = req.body as RequestRefundInput;
    const dispute = await ordersService.requestRefund(req.params.id, req.user!.id, data);
    res.json(new ApiResponse(200, dispute, 'Refund request submitted'));
  },

  async getDownload(req: Request, res: Response) {
    const downloadUrl = await ordersService.getDownloadUrl(req.params.id, req.user!.id);
    res.json(new ApiResponse(200, { downloadUrl }));
  },

  // Admin endpoints
  async getAll(req: Request, res: Response) {
    const query = req.query as unknown as OrderQueryInput;
    const result = await ordersService.getAll(query);
    res.json(new ApiResponse(200, result.data, 'Orders retrieved', { pagination: result.pagination }));
  },

  async updateStatus(req: Request, res: Response) {
    const data = req.body as UpdateOrderStatusInput;
    const order = await ordersService.updateStatus(req.params.id, data);
    res.json(new ApiResponse(200, order, 'Order status updated'));
  },

  async getStats(req: Request, res: Response) {
    const sellerId = req.query.sellerId as string | undefined;
    const stats = await ordersService.getStats(sellerId);
    res.json(new ApiResponse(200, stats));
  },
};
