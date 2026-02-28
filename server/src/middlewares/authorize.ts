import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

type RoleOrRoles = UserRole | UserRole[];

export function authorize(allowedRoles: RoleOrRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw ApiError.forbidden(
          `Access denied. Required role: ${roles.join(' or ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Check if user owns the resource or is admin
export function authorizeOwnerOrAdmin(
  getResourceOwnerId: (req: Request) => Promise<string | null>
) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      // Admins can access everything
      if (['super_admin', 'admin'].includes(req.user.role)) {
        return next();
      }

      const ownerId = await getResourceOwnerId(req);
      
      if (!ownerId) {
        throw ApiError.notFound('Resource not found');
      }

      if (ownerId !== req.user.id) {
        throw ApiError.forbidden('Access denied. You do not own this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Check if user is verified
export function requireVerified(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!req.user.isVerified) {
      throw ApiError.forbidden('Please verify your email to access this resource');
    }

    next();
  } catch (error) {
    next(error);
  }
}

// Admin roles helper
export const ADMIN_ROLES: UserRole[] = ['super_admin', 'admin'];
export const SELLER_ROLES: UserRole[] = ['super_admin', 'admin', 'seller'];
export const BUYER_ROLES: UserRole[] = ['super_admin', 'admin', 'buyer', 'paid_user', 'free_user'];
export const FREELANCER_ROLES: UserRole[] = ['super_admin', 'admin', 'freelancer'];
export const PAID_ROLES: UserRole[] = ['super_admin', 'admin', 'paid_user', 'seller'];
