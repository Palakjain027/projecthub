import { Prisma, ProjectStatus } from '@prisma/client';
import slugify from 'slugify';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { parsePagination, parseSort } from '../../utils/pagination.js';
import { CreateProjectInput, UpdateProjectInput, ProjectQueryInput, RejectProjectInput } from './projects.schema.js';

export class ProjectsService {
  // Generate unique slug
  static async generateSlug(title: string): Promise<string> {
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Get all projects (public with filters)
  static async getAllProjects(query: ProjectQueryInput, includePrivate = false) {
    const pagination = parsePagination(query.page, query.limit);
    const orderBy = parseSort(query.sort, [
      'createdAt',
      'price',
      'averageRating',
      'downloadsCount',
      'viewsCount',
    ]) || { createdAt: 'desc' };

    const where: Prisma.ProjectWhereInput = {};

    // Default: only show approved projects
    if (!includePrivate) {
      where.status = 'approved';
    } else if (query.status) {
      where.status = query.status as ProjectStatus;
    }

    // Search
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ];
    }

    // Category filter
    if (query.category) {
      where.category = { slug: query.category };
    }

    // Tags filter
    if (query.tags) {
      const tagsArray = query.tags.split(',');
      where.tags = { hasEvery: tagsArray };
    }

    // Price filters
    if (query.isFree === 'true') {
      where.isFree = true;
    } else if (query.isFree === 'false') {
      where.isFree = false;
    }

    if (query.minPrice) {
      where.price = { ...where.price as object, gte: parseFloat(query.minPrice) };
    }

    if (query.maxPrice) {
      where.price = { ...where.price as object, lte: parseFloat(query.maxPrice) };
    }

    // Rating filter
    if (query.rating) {
      where.averageRating = { gte: parseFloat(query.rating) };
    }

    // Seller filter
    if (query.sellerId) {
      where.sellerId = query.sellerId;
    }

    // Featured filter
    if (query.featured === 'true') {
      where.isFeatured = true;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
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
          techStack: true,
          averageRating: true,
          reviewCount: true,
          downloadsCount: true,
          viewsCount: true,
          isFeatured: true,
          createdAt: true,
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total, pagination };
  }

  // Get project by ID
  static async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
            _count: {
              select: {
                projects: { where: { status: 'approved' } },
              },
            },
          },
        },
        category: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    return project;
  }

  // Get project by slug (public)
  static async getProjectBySlug(slug: string, incrementViews = true) {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
            _count: {
              select: {
                projects: { where: { status: 'approved' } },
              },
            },
          },
        },
        category: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            orders: true,
          },
        },
      },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Only show approved projects to public
    if (project.status !== 'approved') {
      throw ApiError.notFound('Project not found');
    }

    // Increment views
    if (incrementViews) {
      await prisma.project.update({
        where: { id: project.id },
        data: { viewsCount: { increment: 1 } },
      });
    }

    return project;
  }

  // Create project
  static async createProject(sellerId: string, input: CreateProjectInput) {
    const slug = await this.generateSlug(input.title);

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw ApiError.badRequest('Invalid category');
    }

    const project = await prisma.project.create({
      data: {
        sellerId,
        slug,
        title: input.title,
        shortDescription: input.shortDescription,
        description: input.description,
        categoryId: input.categoryId,
        tags: input.tags || [],
        price: input.isFree ? 0 : input.price,
        isFree: input.isFree || input.price === 0,
        techStack: input.techStack || [],
        features: input.features || [],
        livePreviewUrl: input.livePreviewUrl || null,
        status: 'draft',
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        category: true,
      },
    });

    logger.info('Project created', { projectId: project.id, sellerId });

    return project;
  }

  // Update project
  static async updateProject(id: string, sellerId: string, input: UpdateProjectInput, isAdmin = false) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Check ownership
    if (!isAdmin && project.sellerId !== sellerId) {
      throw ApiError.forbidden('You do not own this project');
    }

    // Verify category if changed
    if (input.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });

      if (!category) {
        throw ApiError.badRequest('Invalid category');
      }
    }

    // Update slug if title changed
    let slug = project.slug;
    if (input.title && input.title !== project.title) {
      slug = await this.generateSlug(input.title);
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...input,
        slug,
        price: input.isFree ? 0 : input.price,
        isFree: input.isFree ?? (input.price === 0),
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        category: true,
      },
    });

    return updatedProject;
  }

  // Submit project for review
  static async submitForReview(id: string, sellerId: string) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (project.sellerId !== sellerId) {
      throw ApiError.forbidden('You do not own this project');
    }

    if (project.status !== 'draft' && project.status !== 'rejected') {
      throw ApiError.badRequest('Project cannot be submitted for review');
    }

    // Validate required fields
    if (!project.sourceCodeUrl) {
      throw ApiError.badRequest('Source code is required');
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { status: 'pending_review', rejectionReason: null },
    });

    return updatedProject;
  }

  // Approve project (admin)
  static async approveProject(id: string, adminId: string) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (project.status !== 'pending_review') {
      throw ApiError.badRequest('Project is not pending review');
    }

    await prisma.$transaction([
      prisma.project.update({
        where: { id },
        data: { status: 'approved', rejectionReason: null },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'APPROVE_PROJECT',
          entity: 'Project',
          entityId: id,
        },
      }),
      prisma.notification.create({
        data: {
          userId: project.sellerId,
          type: 'project_approved',
          title: 'Project Approved!',
          message: `Your project "${project.title}" has been approved and is now live.`,
          data: { projectId: id, projectSlug: project.slug },
        },
      }),
    ]);

    logger.info('Project approved', { projectId: id, adminId });

    return { message: 'Project approved successfully' };
  }

  // Reject project (admin)
  static async rejectProject(id: string, adminId: string, input: RejectProjectInput) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (project.status !== 'pending_review') {
      throw ApiError.badRequest('Project is not pending review');
    }

    await prisma.$transaction([
      prisma.project.update({
        where: { id },
        data: { status: 'rejected', rejectionReason: input.reason },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'REJECT_PROJECT',
          entity: 'Project',
          entityId: id,
          metadata: { reason: input.reason },
        },
      }),
      prisma.notification.create({
        data: {
          userId: project.sellerId,
          type: 'project_rejected',
          title: 'Project Rejected',
          message: `Your project "${project.title}" was not approved. Reason: ${input.reason}`,
          data: { projectId: id, reason: input.reason },
        },
      }),
    ]);

    logger.info('Project rejected', { projectId: id, adminId, reason: input.reason });

    return { message: 'Project rejected' };
  }

  // Feature project (admin)
  static async featureProject(id: string, adminId: string, featured: boolean) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    await prisma.$transaction([
      prisma.project.update({
        where: { id },
        data: { isFeatured: featured },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: featured ? 'FEATURE_PROJECT' : 'UNFEATURE_PROJECT',
          entity: 'Project',
          entityId: id,
        },
      }),
    ]);

    return { message: featured ? 'Project featured' : 'Project unfeatured' };
  }

  // Delete project
  static async deleteProject(id: string, userId: string, isAdmin = false) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!isAdmin && project.sellerId !== userId) {
      throw ApiError.forbidden('You do not own this project');
    }

    // Check if project has orders
    const ordersCount = await prisma.order.count({
      where: { projectId: id },
    });

    if (ordersCount > 0 && !isAdmin) {
      throw ApiError.badRequest('Cannot delete project with existing orders. Please archive instead.');
    }

    await prisma.project.delete({ where: { id } });

    logger.info('Project deleted', { projectId: id, userId });

    return { message: 'Project deleted successfully' };
  }

  // Archive project
  static async archiveProject(id: string, sellerId: string) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (project.sellerId !== sellerId) {
      throw ApiError.forbidden('You do not own this project');
    }

    await prisma.project.update({
      where: { id },
      data: { status: 'archived' },
    });

    return { message: 'Project archived successfully' };
  }

  // Get pending projects (admin)
  static async getPendingProjects(query: ProjectQueryInput) {
    return this.getAllProjects({ ...query, status: 'pending_review' }, true);
  }

  // Update project files (called after file upload)
  static async updateProjectFiles(
    id: string,
    sellerId: string,
    files: {
      thumbnailUrl?: string;
      demoVideoUrl?: string;
      sourceCodeUrl?: string;
      documentationUrl?: string;
    }
  ) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (project.sellerId !== sellerId) {
      throw ApiError.forbidden('You do not own this project');
    }

    return prisma.project.update({
      where: { id },
      data: files,
    });
  }
}
