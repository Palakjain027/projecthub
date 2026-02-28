import { Router } from 'express';
import { freelanceController } from './freelance.controller';
import { authenticate } from '@/middlewares/authenticate';
import { validate } from '@/middlewares/validate';
import {
  createCustomRequestSchema,
  updateCustomRequestSchema,
  createBidSchema,
  updateBidSchema,
  createMilestoneSchema,
  customRequestQuerySchema,
} from './freelance.schema';

const router = Router();

// Public routes
router.get('/requests', validate(customRequestQuerySchema), freelanceController.getRequests);
router.get('/requests/:id', freelanceController.getRequestById);

// Protected routes - all below require authentication
router.use(authenticate);

// Custom Requests
router.post('/requests', validate(createCustomRequestSchema), freelanceController.createRequest);
router.get('/requests/my/list', validate(customRequestQuerySchema), freelanceController.getMyRequests);
router.patch('/requests/:id', validate(updateCustomRequestSchema), freelanceController.updateRequest);
router.delete('/requests/:id', freelanceController.deleteRequest);

// Bids
router.post('/bids', validate(createBidSchema), freelanceController.createBid);
router.get('/bids/my/list', validate(customRequestQuerySchema), freelanceController.getMyBids);
router.get('/bids/:id', freelanceController.getBidById);
router.patch('/bids/:id', validate(updateBidSchema), freelanceController.updateBid);
router.delete('/bids/:id', freelanceController.withdrawBid);
router.post('/bids/:id/accept', freelanceController.acceptBid);
router.post('/bids/:id/reject', freelanceController.rejectBid);

// Milestones
router.post('/requests/:requestId/milestones', validate(createMilestoneSchema), freelanceController.createMilestone);
router.patch('/milestones/:id/status', freelanceController.updateMilestoneStatus);

export default router;
