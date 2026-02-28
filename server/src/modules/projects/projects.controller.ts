import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ProjectsService } from './projects.service.js';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
  RejectProjectInput,
} from './projects.schema.js';

export class ProjectsController {
  // GET /projects
  static async getAllProjects(
    req: Request<{}, {}, {}, ProjectQueryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.getAllProjects(req.query);
      ApiResponse.paginated(
        res,
        result.projects,
        result.pagination.page,
        result.pagination.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /projects/pending (admin)
  static async getPendingProjects(
    req: Request<{}, {}, {}, ProjectQueryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.getPendingProjects(req.query);
      ApiResponse.paginated(
        res,
        result.projects,
        result.pagination.page,
        result.pagination.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /projects/:slug
  static async getProjectBySlug(
    req: Request<{ slug: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await ProjectsService.getProjectBySlug(req.params.slug);
      ApiResponse.success(res, project);
    } catch (error) {
      next(error);
    }
  }

  // GET /projects/id/:id
  static async getProjectById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await ProjectsService.getProjectById(req.params.id);
      ApiResponse.success(res, project);
    } catch (error) {
      next(error);
    }
  }

  // POST /projects
  static async createProject(
    req: Request<{}, {}, CreateProjectInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await ProjectsService.createProject(req.user!.id, req.body);
      ApiResponse.created(res, project, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /projects/:id
  static async updateProject(
    req: Request<{ id: string }, {}, UpdateProjectInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isAdmin = ['super_admin', 'admin'].includes(req.user!.role);
      const project = await ProjectsService.updateProject(
        req.params.id,
        req.user!.id,
        req.body,
        isAdmin
      );
      ApiResponse.success(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /projects/:id/submit
  static async submitForReview(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const project = await ProjectsService.submitForReview(
        req.params.id,
        req.user!.id
      );
      ApiResponse.success(res, project, 'Project submitted for review');
    } catch (error) {
      next(error);
    }
  }

  // POST /projects/:id/approve (admin)
  static async approveProject(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.approveProject(
        req.params.id,
        req.user!.id
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // POST /projects/:id/reject (admin)
  static async rejectProject(
    req: Request<{ id: string }, {}, RejectProjectInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.rejectProject(
        req.params.id,
        req.user!.id,
        req.body
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // POST /projects/:id/feature (admin)
  static async featureProject(
    req: Request<{ id: string }, {}, { featured: boolean }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.featureProject(
        req.params.id,
        req.user!.id,
        req.body.featured ?? true
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /projects/:id
  static async deleteProject(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isAdmin = ['super_admin', 'admin'].includes(req.user!.role);
      const result = await ProjectsService.deleteProject(
        req.params.id,
        req.user!.id,
        isAdmin
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // POST /projects/:id/archive
  static async archiveProject(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.archiveProject(
        req.params.id,
        req.user!.id
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
