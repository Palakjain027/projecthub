import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '@/middlewares/authenticate';
import { validate } from '@/middlewares/validate';
import { notificationQuerySchema } from './notifications.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', validate(notificationQuerySchema), notificationsController.getMyNotifications);
router.get('/unread-count', notificationsController.getUnreadCount);
router.patch('/:id/read', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.delete);
router.delete('/', notificationsController.deleteAll);

export default router;
