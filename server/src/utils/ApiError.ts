export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, unknown>[];
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code: string = 'ERROR',
    details?: Record<string, unknown>[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // Common error factories
  static badRequest(message: string, details?: Record<string, unknown>[]) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new ApiError(409, message, 'CONFLICT');
  }

  static validationError(details: Record<string, unknown>[]) {
    return new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', details);
  }

  static tooManyRequests(message: string = 'Too many requests') {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}
