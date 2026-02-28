import { prisma } from '@/config/database';
import { ApiError } from '@/utils/ApiError';
import { calculatePagination } from '@/utils/pagination';
import type { CreateNotificationInput, NotificationQueryInput } from './notifications.schema';

// Socket.IO instance will be injected
let io: any = null;

export const notificationsService = {
  setSocketIO(socketIO: any) {
    io = socketIO;
  },

  async create(data: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
        isRead: false,
      },
    });

    // Emit real-time notification via Socket.IO
    if (io) {
      io.to(`user:${data.userId}`).emit('notification', notification);
    }

    return notification;
  },

  async getByUser(userId: string, query: NotificationQueryInput) {
    const { page, limit, isRead, type } = query;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = { userId };
    if (isRead !== undefined) where.isRead = isRead;
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'Access denied');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return updated;
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async delete(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'Access denied');
    }

    await prisma.notification.delete({
      where: { id },
    });
  },

  async deleteAll(userId: string) {
    await prisma.notification.deleteMany({
      where: { userId },
    });
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  // Helper methods for creating specific notification types
  async notifyOrderPlaced(buyerId: string, sellerId: string, projectTitle: string, orderId: string) {
    // Notify seller
    await this.create({
      userId: sellerId,
      type: 'order_placed',
      title: 'New Order',
      message: `You have a new order for "${projectTitle}"`,
      link: `/dashboard/orders/${orderId}`,
      metadata: { orderId },
    });
  },

  async notifyOrderCompleted(buyerId: string, projectTitle: string, orderId: string) {
    await this.create({
      userId: buyerId,
      type: 'order_completed',
      title: 'Order Completed',
      message: `Your order for "${projectTitle}" is complete. You can now download it.`,
      link: `/dashboard/orders/${orderId}`,
      metadata: { orderId },
    });
  },

  async notifyNewReview(sellerId: string, projectTitle: string, rating: number, projectSlug: string) {
    await this.create({
      userId: sellerId,
      type: 'new_review',
      title: 'New Review',
      message: `Someone left a ${rating}-star review on "${projectTitle}"`,
      link: `/projects/${projectSlug}#reviews`,
      metadata: { rating },
    });
  },

  async notifyNewBid(clientId: string, requestTitle: string, bidAmount: number, requestId: string) {
    await this.create({
      userId: clientId,
      type: 'new_bid',
      title: 'New Bid',
      message: `New $${bidAmount} bid on your request "${requestTitle}"`,
      link: `/freelance/requests/${requestId}`,
      metadata: { bidAmount },
    });
  },

  async notifyBidAccepted(freelancerId: string, requestTitle: string, requestId: string) {
    await this.create({
      userId: freelancerId,
      type: 'bid_accepted',
      title: 'Bid Accepted!',
      message: `Your bid on "${requestTitle}" has been accepted`,
      link: `/freelance/requests/${requestId}`,
      metadata: { requestId },
    });
  },

  async notifyProjectApproved(sellerId: string, projectTitle: string, projectSlug: string) {
    await this.create({
      userId: sellerId,
      type: 'project_approved',
      title: 'Project Approved',
      message: `Your project "${projectTitle}" has been approved and is now live`,
      link: `/projects/${projectSlug}`,
    });
  },

  async notifyProjectRejected(sellerId: string, projectTitle: string, reason?: string) {
    await this.create({
      userId: sellerId,
      type: 'project_rejected',
      title: 'Project Rejected',
      message: `Your project "${projectTitle}" was not approved. ${reason || 'Please review our guidelines.'}`,
      link: `/dashboard/projects`,
      metadata: { reason },
    });
  },

  async notifyPayoutProcessed(sellerId: string, amount: number) {
    await this.create({
      userId: sellerId,
      type: 'payout_processed',
      title: 'Payout Processed',
      message: `Your payout of $${amount.toFixed(2)} has been processed`,
      link: `/dashboard/earnings`,
      metadata: { amount },
    });
  },
};
