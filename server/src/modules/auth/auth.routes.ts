import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authLimiter, loginLimiter, sensitiveLimiter } from '../../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from './auth.schema.js';

const router = Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  AuthController.register
);

router.post(
  '/login',
  loginLimiter,
  validate({ body: loginSchema }),
  AuthController.login
);

router.post('/logout', AuthController.logout);

router.post('/refresh', AuthController.refresh);

router.post(
  '/verify-email',
  validate({ body: verifyEmailSchema }),
  AuthController.verifyEmail
);

router.post(
  '/resend-verification',
  authLimiter,
  AuthController.resendVerification
);

router.post(
  '/forgot-password',
  sensitiveLimiter,
  validate({ body: forgotPasswordSchema }),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  sensitiveLimiter,
  validate({ body: resetPasswordSchema }),
  AuthController.resetPassword
);

// Protected routes
router.get('/me', authenticate, AuthController.me);

router.post(
  '/change-password',
  authenticate,
  sensitiveLimiter,
  validate({ body: changePasswordSchema }),
  AuthController.changePassword
);

export default router;
