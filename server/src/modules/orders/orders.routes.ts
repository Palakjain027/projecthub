import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import {
  createOrderSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
  requestRefundSchema,
} from './orders.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', validate(createOrderSchema), ordersController.create);
router.get('/purchases', validate(orderQuerySchema), ordersController.getMyPurchases);
router.get('/sales', validate(orderQuerySchema), ordersController.getMySales);
router.get('/:id', ordersController.getById);
router.get('/:id/download', ordersController.getDownload);
router.post('/:id/complete', ordersController.complete);
router.post('/:id/refund', validate(requestRefundSchema), ordersController.requestRefund);

// Admin routes
router.get(
  '/',
  authorize('admin', 'super_admin'),
  validate(orderQuerySchema),
  ordersController.getAll
);

router.patch(
  '/:id/status',
  authorize('admin', 'super_admin'),
  validate(updateOrderStatusSchema),
  ordersController.updateStatus
);

router.get('/stats/overview', authorize('admin', 'super_admin'), ordersController.getStats);

export default router;
