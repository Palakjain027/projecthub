import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { UsersService } from './users.service.js';
import { UpdateUserInput, AdminUpdateUserInput, UserQueryInput, BanUserInput } from './users.schema.js';

export class UsersController {
  // GET /users
  static async getAllUsers(
    req: Request<{}, {}, {}, UserQueryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UsersService.getAllUsers(req.query);
      ApiResponse.paginated(
        res,
        result.users,
        result.pagination.page,
        result.pagination.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /users/:id
  static async getUserById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await UsersService.getUserById(req.params.id);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  // GET /users/username/:username
  static async getUserByUsername(
    req: Request<{ username: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await UsersService.getUserByUsername(req.params.username);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /users/:id
  static async updateUser(
    req: Request<{ id: string }, {}, UpdateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isAdmin = ['super_admin', 'admin'].includes(req.user?.role || '');
      const user = await UsersService.updateUser(
        req.params.id,
        req.body,
        req.user!.id,
        isAdmin
      );
      ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /users/:id/admin
  static async adminUpdateUser(
    req: Request<{ id: string }, {}, AdminUpdateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await UsersService.adminUpdateUser(req.params.id, req.body);
      ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /users/:id/ban
  static async banUser(
    req: Request<{ id: string }, {}, BanUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UsersService.banUser(
        req.params.id,
        req.user!.id,
        req.body.reason
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // POST /users/:id/unban
  static async unbanUser(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UsersService.unbanUser(req.params.id, req.user!.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // POST /users/:id/verify
  static async verifyUser(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UsersService.verifyUser(req.params.id, req.user!.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /users/:id
  static async deleteUser(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UsersService.deleteUser(req.params.id, req.user!.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // GET /users/:id/projects
  static async getUserProjects(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isOwner = req.user?.id === req.params.id;
      const isAdmin = ['super_admin', 'admin'].includes(req.user?.role || '');
      const projects = await UsersService.getUserProjects(
        req.params.id,
        isOwner || isAdmin
      );
      ApiResponse.success(res, projects);
    } catch (error) {
      next(error);
    }
  }

  // GET /users/:id/reviews
  static async getUserReviews(
    req: Request<{ id: string }, {}, {}, { page?: string; limit?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pagination = parsePagination(req.query.page, req.query.limit);
      const result = await UsersService.getUserReviews(req.params.id, pagination);
      ApiResponse.paginated(
        res,
        result.reviews,
        pagination.page,
        pagination.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /users/:id/earnings
  static async getUserEarnings(
    req: Request<{ id: string }, {}, {}, { page?: string; limit?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pagination = parsePagination(req.query.page, req.query.limit);
      const result = await UsersService.getUserEarnings(req.params.id, pagination);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
