import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: Record<string, unknown>[] = [];

      // Validate body
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((e) => ({
                field: `body.${e.path.join('.')}`,
                message: e.message,
              }))
            );
          }
        }
      }

      // Validate query
      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((e) => ({
                field: `query.${e.path.join('.')}`,
                message: e.message,
              }))
            );
          }
        }
      }

      // Validate params
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((e) => ({
                field: `params.${e.path.join('.')}`,
                message: e.message,
              }))
            );
          }
        }
      }

      if (errors.length > 0) {
        throw ApiError.validationError(errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
