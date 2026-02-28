import { Router } from 'express';
import { CategoriesController } from './categories.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize, ADMIN_ROLES } from '../../middlewares/authorize.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from './categories.schema.js';

const router = Router();

// Public routes
router.get('/', CategoriesController.getAllCategories);
router.get('/slug/:slug', CategoriesController.getCategoryBySlug);
router.get('/:id', validate({ params: categoryIdParamSchema }), CategoriesController.getCategoryById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ body: createCategorySchema }),
  CategoriesController.createCategory
);

router.patch(
  '/:id',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  CategoriesController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize(ADMIN_ROLES),
  validate({ params: categoryIdParamSchema }),
  CategoriesController.deleteCategory
);

export default router;
