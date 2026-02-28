import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema.js';

export class CategoriesController {
  // GET /categories
  static async getAllCategories(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categories = await CategoriesService.getAllCategories();
      ApiResponse.success(res, categories);
    } catch (error) {
      next(error);
    }
  }

  // GET /categories/:id
  static async getCategoryById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await CategoriesService.getCategoryById(req.params.id);
      ApiResponse.success(res, category);
    } catch (error) {
      next(error);
    }
  }

  // GET /categories/slug/:slug
  static async getCategoryBySlug(
    req: Request<{ slug: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await CategoriesService.getCategoryBySlug(req.params.slug);
      ApiResponse.success(res, category);
    } catch (error) {
      next(error);
    }
  }

  // POST /categories
  static async createCategory(
    req: Request<{}, {}, CreateCategoryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await CategoriesService.createCategory(req.body);
      ApiResponse.created(res, category, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /categories/:id
  static async updateCategory(
    req: Request<{ id: string }, {}, UpdateCategoryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await CategoriesService.updateCategory(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /categories/:id
  static async deleteCategory(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await CategoriesService.deleteCategory(req.params.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
