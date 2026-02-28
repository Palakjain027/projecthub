import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { blocklist } from '../../config/redis.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { parsePagination, parseSort, PaginationParams } from '../../utils/pagination.js';
import { UpdateUserInput, AdminUpdateUserInput, UserQueryInput } from './users.schema.js';

export class UsersService {
  // Get all users (admin)
  static async getAllUsers(query: UserQueryInput) {
    const pagination = parsePagination(query.page, query.limit);
    const orderBy = parseSort(query.sort, ['createdAt', 'username', 'email']) || { createdAt: 'desc' };

    const where: Prisma.UserWhereInput = {};

    // Search filter
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { username: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (query.role) {
      where.role = query.role as UserRole;
    }

    // Boolean filters
    if (query.isVerified !== undefined) {
      where.isVerified = query.isVerified === 'true';
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    if (query.isBanned !== undefined) {
      where.isBanned = query.isBanned === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          isVerified: true,
          isActive: true,
          isBanned: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              ordersAsBuyer: true,
              ordersAsSeller: true,
            },
          },
        },
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, pagination };
  }

  // Get user by ID
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        isVerified: true,
        isActive: true,
        stripeAccountId: true,
        payoutEnabled: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            ordersAsBuyer: true,
            ordersAsSeller: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  // Get user by username (public profile)
  static async getUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            projects: { where: { status: 'approved' } },
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user || !user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  // Update user
  static async updateUser(id: string, input: UpdateUserInput, requesterId: string, isAdmin: boolean) {
    // Check permissions
    if (!isAdmin && id !== requesterId) {
      throw ApiError.forbidden('You can only update your own profile');
    }

    const user = await prisma.user.update({
      where: { id },
      data: input,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        isVerified: true,
      },
    });

    return user;
  }

  // Admin update user
  static async adminUpdateUser(id: string, input: AdminUpdateUserInput) {
    const user = await prisma.user.update({
      where: { id },
      data: input,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        isActive: true,
        isBanned: true,
      },
    });

    // If user is banned, add to blocklist
    if (input.isBanned === true) {
      await blocklist.add(id, 7 * 24 * 60 * 60); // 7 days
    } else if (input.isBanned === false) {
      await blocklist.remove(id);
    }

    return user;
  }

  // Ban user
  static async banUser(id: string, adminId: string, reason?: string) {
    // Check if admin is trying to ban themselves
    if (id === adminId) {
      throw ApiError.badRequest('You cannot ban yourself');
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Don't allow banning super_admin
    if (user.role === 'super_admin') {
      throw ApiError.forbidden('Cannot ban a super admin');
    }

    // Update user and create audit log
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { isBanned: true },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'BAN_USER',
          entity: 'User',
          entityId: id,
          metadata: { reason },
        },
      }),
      // Invalidate all refresh tokens
      prisma.refreshToken.deleteMany({ where: { userId: id } }),
    ]);

    // Add to blocklist
    await blocklist.add(id, 365 * 24 * 60 * 60); // 1 year

    logger.info('User banned', { userId: id, adminId, reason });

    return { message: 'User banned successfully' };
  }

  // Unban user
  static async unbanUser(id: string, adminId: string) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { isBanned: false },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'UNBAN_USER',
          entity: 'User',
          entityId: id,
        },
      }),
    ]);

    await blocklist.remove(id);

    logger.info('User unbanned', { userId: id, adminId });

    return { message: 'User unbanned successfully' };
  }

  // Verify user
  static async verifyUser(id: string, adminId: string) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { isVerified: true },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'VERIFY_USER',
          entity: 'User',
          entityId: id,
        },
      }),
    ]);

    return { message: 'User verified successfully' };
  }

  // Delete user
  static async deleteUser(id: string, adminId: string) {
    if (id === adminId) {
      throw ApiError.badRequest('You cannot delete yourself');
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.role === 'super_admin') {
      throw ApiError.forbidden('Cannot delete a super admin');
    }

    await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'DELETE_USER',
          entity: 'User',
          entityId: id,
          metadata: { email: user.email, username: user.username },
        },
      }),
      prisma.user.delete({ where: { id } }),
    ]);

    logger.info('User deleted', { userId: id, adminId });

    return { message: 'User deleted successfully' };
  }

  // Get user's projects
  static async getUserProjects(userId: string, isOwner: boolean) {
    const where: Prisma.ProjectWhereInput = { sellerId: userId };

    // If not owner, only show approved projects
    if (!isOwner) {
      where.status = 'approved';
    }

    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        thumbnailUrl: true,
        price: true,
        isFree: true,
        status: true,
        averageRating: true,
        reviewCount: true,
        downloadsCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  // Get user's reviews received
  static async getUserReviews(userId: string, pagination: PaginationParams) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { sellerId: userId },
        select: {
          id: true,
          rating: true,
          comment: true,
          isVerifiedPurchase: true,
          createdAt: true,
          reviewer: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
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
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.review.count({ where: { sellerId: userId } }),
    ]);

    return { reviews, total };
  }

  // Get user's earnings (seller)
  static async getUserEarnings(userId: string, pagination: PaginationParams) {
    const [earnings, total, summary] = await Promise.all([
      prisma.earning.findMany({
        where: { sellerId: userId },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          order: {
            select: {
              id: true,
              project: {
                select: {
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.earning.count({ where: { sellerId: userId } }),
      prisma.earning.aggregate({
        where: { sellerId: userId },
        _sum: { amount: true },
      }),
    ]);

    const pendingEarnings = await prisma.earning.aggregate({
      where: { sellerId: userId, status: 'pending' },
      _sum: { amount: true },
    });

    return {
      earnings,
      total,
      totalEarnings: summary._sum.amount || 0,
      pendingEarnings: pendingEarnings._sum.amount || 0,
    };
  }
}
