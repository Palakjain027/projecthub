import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { AuthService } from './auth.service.js';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ChangePasswordInput,
} from './auth.schema.js';

export class AuthController {
  // POST /auth/register
  static async register(
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      ApiResponse.created(res, result, 'Registration successful. Please verify your email.');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/login
  static async login(
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ApiResponse.success(res, {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/refresh
  static async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new Error('Refresh token required');
      }

      const result = await AuthService.refreshTokens(refreshToken);

      // Set new refresh token in cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/verify-email
  static async verifyEmail(
    req: Request<{}, {}, VerifyEmailInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.verifyEmail(req.body.token);
      ApiResponse.success(res, result, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/resend-verification
  static async resendVerification(
    req: Request<{}, {}, { email: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.resendVerification(req.body.email);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/forgot-password
  static async forgotPassword(
    req: Request<{}, {}, ForgotPasswordInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/reset-password
  static async resetPassword(
    req: Request<{}, {}, ResetPasswordInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.resetPassword(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/change-password
  static async changePassword(
    req: Request<{}, {}, ChangePasswordInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('Authentication required');
      }
      const result = await AuthService.changePassword(req.user.id, req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // GET /auth/me
  static async me(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('Authentication required');
      }
      const user = await AuthService.getCurrentUser(req.user.id);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }
}
