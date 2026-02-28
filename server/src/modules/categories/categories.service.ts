import slugify from 'slugify';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema.js';

export class CategoriesService {
  // Generate unique slug
  static async generateSlug(name: string): Promise<string> {
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Get all categories
  static async getAllCategories() {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            _count: {
              select: {
                projects: { where: { status: 'approved' } },
              },
            },
          },
        },
        _count: {
          select: {
            projects: { where: { status: 'approved' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  // Get category by ID
  static async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            projects: { where: { status: 'approved' } },
          },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return category;
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: {
                projects: { where: { status: 'approved' } },
              },
            },
          },
        },
        _count: {
          select: {
            projects: { where: { status: 'approved' } },
          },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return category;
  }

  // Create category
  static async createCategory(input: CreateCategoryInput) {
    const slug = await this.generateSlug(input.name);

    // Verify parent exists if provided
    if (input.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });

      if (!parent) {
        throw ApiError.badRequest('Parent category not found');
      }
    }

    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        icon: input.icon,
        parentId: input.parentId,
      },
    });

    return category;
  }

  // Update category
  static async updateCategory(id: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Update slug if name changed
    let slug = category.slug;
    if (input.name && input.name !== category.name) {
      slug = await this.generateSlug(input.name);
    }

    // Verify parent if changed
    if (input.parentId && input.parentId !== category.parentId) {
      if (input.parentId === id) {
        throw ApiError.badRequest('Category cannot be its own parent');
      }

      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });

      if (!parent) {
        throw ApiError.badRequest('Parent category not found');
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...input,
        slug,
      },
    });
  }

  // Delete category
  static async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (category._count.projects > 0) {
      throw ApiError.badRequest('Cannot delete category with projects');
    }

    if (category._count.children > 0) {
      throw ApiError.badRequest('Cannot delete category with subcategories');
    }

    await prisma.category.delete({ where: { id } });

    return { message: 'Category deleted successfully' };
  }
}
