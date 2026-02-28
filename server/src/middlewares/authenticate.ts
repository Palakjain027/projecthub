import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { blocklist } from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';
import { JwtPayload } from '../types/index.js';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access token required');
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Access token expired');
      }
      throw ApiError.unauthorized('Invalid access token');
    }

    // Check if it's an access token
    if (decoded.type !== 'access') {
      throw ApiError.unauthorized('Invalid token type');
    }

    // Check blocklist (banned users)
    const isBlocked = await blocklist.check(decoded.userId);
    if (isBlocked) {
      throw ApiError.forbidden('Account has been suspended');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        isActive: true,
        isBanned: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    if (user.isBanned) {
      throw ApiError.forbidden('Account has been banned');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// Optional authentication - doesn't throw if no token
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
      
      if (decoded.type !== 'access') {
        return next();
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isVerified: true,
          isActive: true,
          isBanned: true,
        },
      });

      if (user && user.isActive && !user.isBanned) {
        req.user = user;
      }
    } catch {
      // Token invalid, continue without user
    }

    next();
  } catch (error) {
    next(error);
  }
}
