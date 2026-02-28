import { prisma } from '@/config/database';
import { ApiError } from '@/utils/ApiError';
import { calculatePagination } from '@/utils/pagination';
import type { CreateOrderInput, OrderQueryInput, UpdateOrderStatusInput, RequestRefundInput } from './orders.schema';

const PLATFORM_FEE_PERCENTAGE = 0.10; // 10% platform fee

export const ordersService = {
  async create(buyerId: string, data: CreateOrderInput) {
    // Get project with seller info
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { seller: true },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    if (project.status !== 'approved') {
      throw new ApiError(400, 'Project is not available for purchase');
    }

    if (project.sellerId === buyerId) {
      throw new ApiError(400, 'You cannot purchase your own project');
    }

    // Check if user already purchased this project
    const existingOrder = await prisma.order.findFirst({
      where: {
        buyerId,
        projectId: data.projectId,
        status: { in: ['pending', 'completed'] },
      },
    });

    if (existingOrder) {
      throw new ApiError(400, 'You have already purchased this project');
    }

    // Calculate prices based on license type
    let price = project.price;
    if (data.licenseType === 'extended') {
      price = project.extendedLicensePrice || project.price * 3;
    } else if (data.licenseType === 'unlimited') {
      price = project.unlimitedLicensePrice || project.price * 10;
    }

    const platformFee = price * PLATFORM_FEE_PERCENTAGE;
    const sellerAmount = price - platformFee;

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerId,
        sellerId: project.sellerId,
        projectId: data.projectId,
        amount: price,
        platformFee,
        sellerAmount,
        licenseType: data.licenseType,
        status: 'pending',
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return order;
  },

  async getById(id: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            downloadUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check if user has access to this order
    if (userId && order.buyerId !== userId && order.sellerId !== userId) {
      throw new ApiError(403, 'You do not have access to this order');
    }

    return order;
  },

  async getMyPurchases(buyerId: string, query: OrderQueryInput) {
    const { page, limit, status, sort, order } = query;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = { buyerId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getMySales(sellerId: string, query: OrderQueryInput) {
    const { page, limit, status, sort, order } = query;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = { sellerId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async completeOrder(orderId: string, stripePaymentId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status !== 'pending') {
      throw new ApiError(400, 'Order cannot be completed');
    }

    // Update order and create earning record
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'completed',
          stripePaymentId,
          completedAt: new Date(),
        },
        include: {
          project: true,
          seller: true,
          buyer: true,
        },
      }),
      prisma.earning.create({
        data: {
          sellerId: order.sellerId,
          orderId: order.id,
          amount: order.sellerAmount,
          status: 'pending',
        },
      }),
      // Increment project sales count
      prisma.project.update({
        where: { id: order.projectId },
        data: {
          salesCount: { increment: 1 },
        },
      }),
    ]);

    return updatedOrder;
  },

  async requestRefund(orderId: string, buyerId: string, data: RequestRefundInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.buyerId !== buyerId) {
      throw new ApiError(403, 'You can only request refund for your own orders');
    }

    if (order.status !== 'completed') {
      throw new ApiError(400, 'Refund can only be requested for completed orders');
    }

    // Check refund window (e.g., 14 days)
    const refundWindow = 14 * 24 * 60 * 60 * 1000; // 14 days in ms
    if (order.completedAt && Date.now() - order.completedAt.getTime() > refundWindow) {
      throw new ApiError(400, 'Refund window has expired');
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        orderId,
        initiatorId: buyerId,
        reason: data.reason,
        status: 'open',
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'disputed' },
    });

    return dispute;
  },

  async getAll(query: OrderQueryInput) {
    const { page, limit, status, sort, order } = query;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateStatus(orderId: string, data: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: data.status,
        ...(data.status === 'completed' && { completedAt: new Date() }),
        ...(data.status === 'refunded' && { refundedAt: new Date() }),
      },
    });

    return updatedOrder;
  },

  async getDownloadUrl(orderId: string, buyerId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        project: {
          select: {
            downloadUrl: true,
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.buyerId !== buyerId) {
      throw new ApiError(403, 'You do not have access to this download');
    }

    if (order.status !== 'completed') {
      throw new ApiError(400, 'Order must be completed to download');
    }

    // In a real app, generate a signed URL from S3/cloud storage
    return order.project.downloadUrl;
  },

  async getStats(sellerId?: string) {
    const where: any = {};
    if (sellerId) where.sellerId = sellerId;

    const [totalOrders, completedOrders, totalRevenue, monthlyRevenue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'completed' } }),
      prisma.order.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: 'completed',
          completedAt: {
            gte: new Date(new Date().setDate(1)), // First day of current month
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
    };
  },
};
