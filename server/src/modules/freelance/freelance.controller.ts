import { Request, Response } from 'express';
import { freelanceService } from './freelance.service';
import { ApiResponse } from '@/utils/ApiResponse';
import type {
  CreateCustomRequestInput,
  UpdateCustomRequestInput,
  CreateBidInput,
  UpdateBidInput,
  CreateMilestoneInput,
  CustomRequestQueryInput,
} from './freelance.schema';

export const freelanceController = {
  // Custom Requests
  async createRequest(req: Request, res: Response) {
    const data = req.body as CreateCustomRequestInput;
    const request = await freelanceService.createRequest(req.user!.id, data);
    res.status(201).json(new ApiResponse(201, request, 'Request created successfully'));
  },

  async getRequestById(req: Request, res: Response) {
    const request = await freelanceService.getRequestById(req.params.id);
    res.json(new ApiResponse(200, request));
  },

  async getRequests(req: Request, res: Response) {
    const query = req.query as unknown as CustomRequestQueryInput;
    const result = await freelanceService.getRequests(query);
    res.json(new ApiResponse(200, result.data, 'Requests retrieved', { pagination: result.pagination }));
  },

  async getMyRequests(req: Request, res: Response) {
    const query = req.query as unknown as CustomRequestQueryInput;
    const result = await freelanceService.getMyRequests(req.user!.id, query);
    res.json(new ApiResponse(200, result.data, 'Requests retrieved', { pagination: result.pagination }));
  },

  async updateRequest(req: Request, res: Response) {
    const data = req.body as UpdateCustomRequestInput;
    const request = await freelanceService.updateRequest(req.params.id, req.user!.id, data);
    res.json(new ApiResponse(200, request, 'Request updated successfully'));
  },

  async deleteRequest(req: Request, res: Response) {
    await freelanceService.deleteRequest(req.params.id, req.user!.id);
    res.json(new ApiResponse(200, null, 'Request deleted successfully'));
  },

  // Bids
  async createBid(req: Request, res: Response) {
    const data = req.body as CreateBidInput;
    const bid = await freelanceService.createBid(req.user!.id, data);
    res.status(201).json(new ApiResponse(201, bid, 'Bid placed successfully'));
  },

  async getBidById(req: Request, res: Response) {
    const bid = await freelanceService.getBidById(req.params.id);
    res.json(new ApiResponse(200, bid));
  },

  async getMyBids(req: Request, res: Response) {
    const query = req.query as unknown as CustomRequestQueryInput;
    const result = await freelanceService.getMyBids(req.user!.id, query);
    res.json(new ApiResponse(200, result.data, 'Bids retrieved', { pagination: result.pagination }));
  },

  async updateBid(req: Request, res: Response) {
    const data = req.body as UpdateBidInput;
    const bid = await freelanceService.updateBid(req.params.id, req.user!.id, data);
    res.json(new ApiResponse(200, bid, 'Bid updated successfully'));
  },

  async withdrawBid(req: Request, res: Response) {
    await freelanceService.withdrawBid(req.params.id, req.user!.id);
    res.json(new ApiResponse(200, null, 'Bid withdrawn successfully'));
  },

  async acceptBid(req: Request, res: Response) {
    const bid = await freelanceService.acceptBid(req.params.id, req.user!.id);
    res.json(new ApiResponse(200, bid, 'Bid accepted successfully'));
  },

  async rejectBid(req: Request, res: Response) {
    const bid = await freelanceService.rejectBid(req.params.id, req.user!.id);
    res.json(new ApiResponse(200, bid, 'Bid rejected'));
  },

  // Milestones
  async createMilestone(req: Request, res: Response) {
    const data = req.body as CreateMilestoneInput;
    const milestone = await freelanceService.createMilestone(
      req.params.requestId,
      req.user!.id,
      data
    );
    res.status(201).json(new ApiResponse(201, milestone, 'Milestone created successfully'));
  },

  async updateMilestoneStatus(req: Request, res: Response) {
    const { status } = req.body;
    const milestone = await freelanceService.updateMilestoneStatus(
      req.params.id,
      req.user!.id,
      status
    );
    res.json(new ApiResponse(200, milestone, 'Milestone status updated'));
  },
};
