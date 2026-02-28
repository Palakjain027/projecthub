import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details: Record<string, unknown>[] | undefined;

  // Handle ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    details = err.details;
  }

  // Handle Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        statusCode = 409;
        message = 'A record with this value already exists';
        code = 'DUPLICATE_ENTRY';
        const field = (err.meta?.target as string[])?.join(', ') || 'field';
        details = [{ field, message: `${field} already exists` }];
        break;
      
      case 'P2025':
        // Record not found
        statusCode = 404;
        message = 'Record not found';
        code = 'NOT_FOUND';
        break;
      
      case 'P2003':
        // Foreign key constraint failed
        statusCode = 400;
        message = 'Related record not found';
        code = 'FOREIGN_KEY_ERROR';
        break;
      
      default:
        logger.error('Prisma error', err, { code: err.code, meta: err.meta });
    }
  }

  // Handle Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    code = 'VALIDATION_ERROR';
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Handle SyntaxError (JSON parsing)
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON';
    code = 'INVALID_JSON';
  }

  // Log errors
  if (statusCode >= 500) {
    logger.error('Server error', err, {
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    });
  } else if (env.isDev) {
    logger.debug('Client error', {
      path: req.path,
      method: req.method,
      statusCode,
      message,
    });
  }

  ApiResponse.error(res, statusCode, message, code, details, req.requestId);
};

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
  ApiResponse.error(
    res,
    404,
    `Route ${req.method} ${req.path} not found`,
    'NOT_FOUND'
  );
}
