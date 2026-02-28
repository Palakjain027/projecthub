import { Request, Response } from 'express';
import { reviewsService } from './reviews.service';
import { ApiResponse } from '@/utils/ApiResponse';
import type { CreateReviewInput, UpdateReviewInput, ReplyToReviewInput, ReviewQueryInput } from './reviews.schema';

export const reviewsController = {
  async create(req: Request, res: Response) {
    const data = req.body as CreateReviewInput;
    const review = await reviewsService.create(req.user!.id, data);
    res.status(201).json(new ApiResponse(201, review, 'Review created successfully'));
  },

  async getById(req: Request, res: Response) {
    const review = await reviewsService.getById(req.params.id);
    res.json(new ApiResponse(200, review));
  },

  async getByProject(req: Request, res: Response) {
    const query = req.query as unknown as ReviewQueryInput;
    const result = await reviewsService.getByProject(req.params.projectId, query);
    res.json(new ApiResponse(200, result.data, 'Reviews retrieved', { pagination: result.pagination }));
  },

  async getMyReviews(req: Request, res: Response) {
    const query = req.query as unknown as ReviewQueryInput;
    const result = await reviewsService.getMyReviews(req.user!.id, query);
    res.json(new ApiResponse(200, result.data, 'Reviews retrieved', { pagination: result.pagination }));
  },

  async update(req: Request, res: Response) {
    const data = req.body as UpdateReviewInput;
    const review = await reviewsService.update(req.params.id, req.user!.id, data);
    res.json(new ApiResponse(200, review, 'Review updated successfully'));
  },

  async delete(req: Request, res: Response) {
    const isAdmin = ['admin', 'super_admin'].includes(req.user!.role);
    await reviewsService.delete(req.params.id, req.user!.id, isAdmin);
    res.json(new ApiResponse(200, null, 'Review deleted successfully'));
  },

  async reply(req: Request, res: Response) {
    const data = req.body as ReplyToReviewInput;
    const review = await reviewsService.reply(req.params.id, req.user!.id, data);
    res.json(new ApiResponse(200, review, 'Reply added successfully'));
  },

  async markHelpful(req: Request, res: Response) {
    const review = await reviewsService.markHelpful(req.params.id, req.user!.id);
    res.json(new ApiResponse(200, review, 'Review marked as helpful'));
  },

  // Admin
  async getAll(req: Request, res: Response) {
    const query = req.query as unknown as ReviewQueryInput;
    const result = await reviewsService.getAll(query);
    res.json(new ApiResponse(200, result.data, 'Reviews retrieved', { pagination: result.pagination }));
  },
};
