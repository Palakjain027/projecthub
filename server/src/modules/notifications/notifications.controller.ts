import { Request, Response } from 'express';
import { notificationsService } from './notifications.service';
import { ApiResponse } from '@/utils/ApiResponse';
import type { NotificationQueryInput } from './notifications.schema';

export const notificationsController = {
  async getMyNotifications(req: Request, res: Response) {
    const query = req.query as unknown as NotificationQueryInput;
    const result = await notificationsService.getByUser(req.user!.id, query);
    res.json(new ApiResponse(200, result.data, 'Notifications retrieved', {
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    }));
  },

  async getUnreadCount(req: Request, res: Response) {
    const count = await notificationsService.getUnreadCount(req.user!.id);
    res.json(new ApiResponse(200, { count }));
  },

  async markAsRead(req: Request, res: Response) {
    const notification = await notificationsService.markAsRead(req.params.id, req.user!.id);
    res.json(new ApiResponse(200, notification, 'Notification marked as read'));
  },

  async markAllAsRead(req: Request, res: Response) {
    await notificationsService.markAllAsRead(req.user!.id);
    res.json(new ApiResponse(200, null, 'All notifications marked as read'));
  },

  async delete(req: Request, res: Response) {
    await notificationsService.delete(req.params.id, req.user!.id);
    res.json(new ApiResponse(200, null, 'Notification deleted'));
  },

  async deleteAll(req: Request, res: Response) {
    await notificationsService.deleteAll(req.user!.id);
    res.json(new ApiResponse(200, null, 'All notifications deleted'));
  },
};
