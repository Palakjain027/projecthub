import { prisma } from '@/config/database';
import { ApiError } from '@/utils/ApiError';
import { calculatePagination } from '@/utils/pagination';
import type { CreateReviewInput, UpdateReviewInput, ReplyToReviewInput, ReviewQueryInput } from './reviews.schema';

export const reviewsService = {
  async create(userId: string, data: CreateReviewInput) {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Check if user has purchased the project
    const hasPurchased = await prisma.order.findFirst({
      where: {
        buyerId: userId,
        projectId: data.projectId,
        status: 'completed',
      },
    });

    if (!hasPurchased) {
      throw new ApiError(403, 'You must purchase the project before reviewing');
    }

    // Check if user already reviewed this project
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        projectId: data.projectId,
      },
    });

    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this project');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        projectId: data.projectId,
        orderId: data.orderId || hasPurchased.id,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Update project average rating
    await this.updateProjectRating(data.projectId);

    return review;
  },

  async getById(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    return review;
  },

  async getByProject(projectId: string, query: ReviewQueryInput) {
    const { page, limit, rating, sort, order } = query;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = { projectId };
    if (rating) where.rating = rating;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take,
        orderBy: sort === 'helpful' ? { helpfulCount: order } : { [sort]: order },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getMyReviews(userId: string, query: ReviewQueryInput) {
    const { page, limit, sort, order } = query;
    const { skip, take } = calculatePagination(page, limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
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
        },
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async update(id: string, userId: string, data: UpdateReviewInput) {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    if (review.userId !== userId) {
      throw new ApiError(403, 'You can only edit your own reviews');
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Update project average rating if rating changed
    if (data.rating) {
      await this.updateProjectRating(review.projectId);
    }

    return updatedReview;
  },

  async delete(id: string, userId: string, isAdmin = false) {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    if (!isAdmin && review.userId !== userId) {
      throw new ApiError(403, 'You can only delete your own reviews');
    }

    await prisma.review.delete({
      where: { id },
    });

    // Update project average rating
    await this.updateProjectRating(review.projectId);
  },

  async reply(id: string, sellerId: string, data: ReplyToReviewInput) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    if (review.project.sellerId !== sellerId) {
      throw new ApiError(403, 'Only the project seller can reply to reviews');
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        sellerReply: data.reply,
        sellerReplyAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return updatedReview;
  },

  async markHelpful(id: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    if (review.userId === userId) {
      throw new ApiError(400, 'You cannot mark your own review as helpful');
    }

    // In a real app, you'd track which users marked which reviews as helpful
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        helpfulCount: { increment: 1 },
      },
    });

    return updatedReview;
  },

  async updateProjectRating(projectId: string) {
    const aggregation = await prisma.review.aggregate({
      where: { projectId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        averageRating: aggregation._avg.rating || 0,
        reviewCount: aggregation._count,
      },
    });
  },

  async getAll(query: ReviewQueryInput) {
    const { page, limit, projectId, rating, sort, order } = query;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (rating) where.rating = rating;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
