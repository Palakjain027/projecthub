import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorize, authorizeOwnerOrAdmin, ADMIN_ROLES } from '../../middlewares/authorize.js';
import { prisma } from '../../config/database.js';
import {
  updateUserSchema,
  adminUpdateUserSchema,
  userQuerySchema,
  userIdParamSchema,
  banUserSchema,
} from './users.schema.js';

const router = Router();

// Admin routes
router.get(
  '/',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ query: userQuerySchema }),
  UsersController.getAllUsers
);

// Public route - get user by username
router.get(
  '/username/:username',
  optionalAuth,
  UsersController.getUserByUsername
);

// Get user by ID
router.get(
  '/:id',
  authenticate,
  validate({ params: userIdParamSchema }),
  UsersController.getUserById
);

// Update user (self or admin)
router.patch(
  '/:id',
  authenticate,
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  UsersController.updateUser
);

// Admin update user
router.patch(
  '/:id/admin',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: userIdParamSchema, body: adminUpdateUserSchema }),
  UsersController.adminUpdateUser
);

// Ban user
router.post(
  '/:id/ban',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: userIdParamSchema, body: banUserSchema }),
  UsersController.banUser
);

// Unban user
router.post(
  '/:id/unban',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: userIdParamSchema }),
  UsersController.unbanUser
);

// Verify user
router.post(
  '/:id/verify',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: userIdParamSchema }),
  UsersController.verifyUser
);

// Delete user
router.delete(
  '/:id',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: userIdParamSchema }),
  UsersController.deleteUser
);

// Get user's projects
router.get(
  '/:id/projects',
  optionalAuth,
  validate({ params: userIdParamSchema }),
  UsersController.getUserProjects
);

// Get user's reviews
router.get(
  '/:id/reviews',
  validate({ params: userIdParamSchema }),
  UsersController.getUserReviews
);

// Get user's earnings (self or admin)
router.get(
  '/:id/earnings',
  authenticate,
  authorizeOwnerOrAdmin(async (req) => req.params.id),
  validate({ params: userIdParamSchema }),
  UsersController.getUserEarnings
);

export default router;
