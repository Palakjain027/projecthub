import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      username: string;
      role: UserRole;
      isVerified: boolean;
      isActive: boolean;
      isBanned: boolean;
    }

    interface Request {
      user?: User;
      requestId?: string;
    }
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
}

export interface FilterQuery {
  category?: string;
  tags?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  isFree?: string;
  status?: string;
}
