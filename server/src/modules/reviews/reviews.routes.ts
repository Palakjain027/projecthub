import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import {
  createReviewSchema,
  updateReviewSchema,
  replyToReviewSchema,
  reviewQuerySchema,
} from './reviews.schema';

const router = Router();

// Public routes
router.get('/project/:projectId', validate(reviewQuerySchema), reviewsController.getByProject);
router.get('/:id', reviewsController.getById);

// Protected routes
router.post('/', authenticate, validate(createReviewSchema), reviewsController.create);
router.get('/my/reviews', authenticate, validate(reviewQuerySchema), reviewsController.getMyReviews);
router.patch('/:id', authenticate, validate(updateReviewSchema), reviewsController.update);
router.delete('/:id', authenticate, reviewsController.delete);
router.post('/:id/reply', authenticate, validate(replyToReviewSchema), reviewsController.reply);
router.post('/:id/helpful', authenticate, reviewsController.markHelpful);

// Admin routes
router.get(
  '/',
  authenticate,
  authorize('admin', 'super_admin'),
  validate(reviewQuerySchema),
  reviewsController.getAll
);

export default router;
