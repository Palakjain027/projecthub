import { Router } from 'express';
import { ProjectsController } from './projects.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorize, ADMIN_ROLES, SELLER_ROLES } from '../../middlewares/authorize.js';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  projectIdParamSchema,
  projectSlugParamSchema,
  rejectProjectSchema,
} from './projects.schema.js';

const router = Router();

// Public routes
router.get(
  '/',
  optionalAuth,
  validate({ query: projectQuerySchema }),
  ProjectsController.getAllProjects
);

// Get project by slug (public)
router.get(
  '/slug/:slug',
  optionalAuth,
  validate({ params: projectSlugParamSchema }),
  ProjectsController.getProjectBySlug
);

// Admin routes - must come before /:id routes
router.get(
  '/pending',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ query: projectQuerySchema }),
  ProjectsController.getPendingProjects
);

// Get project by ID
router.get(
  '/:id',
  authenticate,
  validate({ params: projectIdParamSchema }),
  ProjectsController.getProjectById
);

// Create project (seller)
router.post(
  '/',
  authenticate,
  authorize(SELLER_ROLES),
  validate({ body: createProjectSchema }),
  ProjectsController.createProject
);

// Update project
router.patch(
  '/:id',
  authenticate,
  authorize(SELLER_ROLES),
  validate({ params: projectIdParamSchema, body: updateProjectSchema }),
  ProjectsController.updateProject
);

// Submit for review (seller)
router.post(
  '/:id/submit',
  authenticate,
  authorize(SELLER_ROLES),
  validate({ params: projectIdParamSchema }),
  ProjectsController.submitForReview
);

// Approve project (admin)
router.post(
  '/:id/approve',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: projectIdParamSchema }),
  ProjectsController.approveProject
);

// Reject project (admin)
router.post(
  '/:id/reject',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: projectIdParamSchema, body: rejectProjectSchema }),
  ProjectsController.rejectProject
);

// Feature project (admin)
router.post(
  '/:id/feature',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: projectIdParamSchema }),
  ProjectsController.featureProject
);

// Archive project (seller)
router.post(
  '/:id/archive',
  authenticate,
  authorize(SELLER_ROLES),
  validate({ params: projectIdParamSchema }),
  ProjectsController.archiveProject
);

// Delete project
router.delete(
  '/:id',
  authenticate,
  authorize(SELLER_ROLES),
  validate({ params: projectIdParamSchema }),
  ProjectsController.deleteProject
);

export default router;
