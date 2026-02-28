import { prisma } from '@/config/database';
import { ApiError } from '@/utils/ApiError';
import { calculatePagination } from '@/utils/pagination';
import type {
  CreateCustomRequestInput,
  UpdateCustomRequestInput,
  CreateBidInput,
  UpdateBidInput,
  CreateMilestoneInput,
  CustomRequestQueryInput,
} from './freelance.schema';

export const freelanceService = {
  // Custom Requests
  async createRequest(clientId: string, data: CreateCustomRequestInput) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    const request = await prisma.customRequest.create({
      data: {
        ...data,
        clientId,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        status: 'open',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        category: true,
        _count: {
          select: { bids: true },
        },
      },
    });

    return request;
  },

  async getRequestById(id: string) {
    const request = await prisma.customRequest.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        category: true,
        bids: {
          include: {
            freelancer: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                bio: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        acceptedBid: {
          include: {
            freelancer: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        milestones: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { bids: true },
        },
      },
    });

    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    return request;
  },

  async getRequests(query: CustomRequestQueryInput) {
    const { page, limit, categoryId, status, minBudget, maxBudget, sort, order } = query;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget.gte = minBudget;
      if (maxBudget) where.budget.lte = maxBudget;
    }

    const [requests, total] = await Promise.all([
      prisma.customRequest.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          category: true,
          _count: {
            select: { bids: true },
          },
        },
      }),
      prisma.customRequest.count({ where }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getMyRequests(clientId: string, query: CustomRequestQueryInput) {
    const { page, limit, status, sort, order } = query;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = { clientId };
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      prisma.customRequest.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        include: {
          category: true,
          _count: {
            select: { bids: true },
          },
        },
      }),
      prisma.customRequest.count({ where }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateRequest(id: string, clientId: string, data: UpdateCustomRequestInput) {
    const request = await prisma.customRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    if (request.clientId !== clientId) {
      throw new ApiError(403, 'You can only update your own requests');
    }

    if (request.status !== 'open' && data.status !== 'cancelled') {
      throw new ApiError(400, 'Cannot modify request after bids are accepted');
    }

    const updatedRequest = await prisma.customRequest.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
      include: {
        category: true,
        _count: {
          select: { bids: true },
        },
      },
    });

    return updatedRequest;
  },

  async deleteRequest(id: string, clientId: string) {
    const request = await prisma.customRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    if (request.clientId !== clientId) {
      throw new ApiError(403, 'You can only delete your own requests');
    }

    if (request.status !== 'open') {
      throw new ApiError(400, 'Cannot delete request that is in progress');
    }

    await prisma.customRequest.delete({
      where: { id },
    });
  },

  // Bids
  async createBid(freelancerId: string, data: CreateBidInput) {
    const request = await prisma.customRequest.findUnique({
      where: { id: data.requestId },
    });

    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    if (request.status !== 'open') {
      throw new ApiError(400, 'Request is no longer accepting bids');
    }

    if (request.clientId === freelancerId) {
      throw new ApiError(400, 'You cannot bid on your own request');
    }

    // Check if freelancer already bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        requestId: data.requestId,
        freelancerId,
      },
    });

    if (existingBid) {
      throw new ApiError(400, 'You have already placed a bid on this request');
    }

    const bid = await prisma.bid.create({
      data: {
        ...data,
        freelancerId,
        status: 'pending',
      },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return bid;
  },

  async getBidById(id: string) {
    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        request: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }

    return bid;
  },

  async getMyBids(freelancerId: string, query: CustomRequestQueryInput) {
    const { page, limit, status, sort, order } = query;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = { freelancerId };
    if (status) {
      where.request = { status };
    }

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        include: {
          request: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                },
              },
              category: true,
            },
          },
        },
      }),
      prisma.bid.count({ where }),
    ]);

    return {
      data: bids,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateBid(id: string, freelancerId: string, data: UpdateBidInput) {
    const bid = await prisma.bid.findUnique({
      where: { id },
      include: { request: true },
    });

    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }

    if (bid.freelancerId !== freelancerId) {
      throw new ApiError(403, 'You can only update your own bids');
    }

    if (bid.status !== 'pending') {
      throw new ApiError(400, 'Cannot update bid after it has been accepted or rejected');
    }

    const updatedBid = await prisma.bid.update({
      where: { id },
      data,
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return updatedBid;
  },

  async withdrawBid(id: string, freelancerId: string) {
    const bid = await prisma.bid.findUnique({
      where: { id },
    });

    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }

    if (bid.freelancerId !== freelancerId) {
      throw new ApiError(403, 'You can only withdraw your own bids');
    }

    if (bid.status !== 'pending') {
      throw new ApiError(400, 'Cannot withdraw bid after it has been processed');
    }

    await prisma.bid.delete({
      where: { id },
    });
  },

  async acceptBid(bidId: string, clientId: string) {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { request: true },
    });

    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }

    if (bid.request.clientId !== clientId) {
      throw new ApiError(403, 'You can only accept bids on your own requests');
    }

    if (bid.request.status !== 'open') {
      throw new ApiError(400, 'Request is no longer accepting bids');
    }

    // Accept bid and update request
    const [updatedBid] = await prisma.$transaction([
      prisma.bid.update({
        where: { id: bidId },
        data: { status: 'accepted' },
        include: {
          freelancer: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.customRequest.update({
        where: { id: bid.requestId },
        data: {
          status: 'in_progress',
          acceptedBidId: bidId,
        },
      }),
      // Reject other bids
      prisma.bid.updateMany({
        where: {
          requestId: bid.requestId,
          id: { not: bidId },
        },
        data: { status: 'rejected' },
      }),
    ]);

    return updatedBid;
  },

  async rejectBid(bidId: string, clientId: string) {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { request: true },
    });

    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }

    if (bid.request.clientId !== clientId) {
      throw new ApiError(403, 'You can only reject bids on your own requests');
    }

    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'rejected' },
    });

    return updatedBid;
  },

  // Milestones
  async createMilestone(requestId: string, userId: string, data: CreateMilestoneInput) {
    const request = await prisma.customRequest.findUnique({
      where: { id: requestId },
      include: { acceptedBid: true },
    });

    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    // Only client or accepted freelancer can create milestones
    const isClient = request.clientId === userId;
    const isFreelancer = request.acceptedBid?.freelancerId === userId;

    if (!isClient && !isFreelancer) {
      throw new ApiError(403, 'You do not have permission to create milestones');
    }

    const milestone = await prisma.milestone.create({
      data: {
        requestId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'pending',
      },
    });

    return milestone;
  },

  async updateMilestoneStatus(milestoneId: string, userId: string, status: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        request: {
          include: { acceptedBid: true },
        },
      },
    });

    if (!milestone) {
      throw new ApiError(404, 'Milestone not found');
    }

    const isClient = milestone.request.clientId === userId;
    const isFreelancer = milestone.request.acceptedBid?.freelancerId === userId;

    if (!isClient && !isFreelancer) {
      throw new ApiError(403, 'You do not have permission to update this milestone');
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status,
        ...(status === 'completed' && { completedAt: new Date() }),
      },
    });

    // Check if all milestones are completed
    if (status === 'completed') {
      const pendingMilestones = await prisma.milestone.count({
        where: {
          requestId: milestone.requestId,
          status: { not: 'completed' },
        },
      });

      if (pendingMilestones === 0) {
        await prisma.customRequest.update({
          where: { id: milestone.requestId },
          data: { status: 'completed' },
        });
      }
    }

    return updatedMilestone;
  },
};
