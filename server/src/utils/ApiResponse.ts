import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    pagination?: PaginationMeta;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>[];
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    pagination?: PaginationMeta
  ): Response {
    const response: SuccessResponse<T> = {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...(pagination && { pagination }),
      },
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success'
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return this.success(res, data, message, 200, pagination);
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    code: string = 'ERROR',
    details?: Record<string, unknown>[],
    requestId?: string
  ): Response {
    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
      },
    };

    return res.status(statusCode).json(response);
  }
}
